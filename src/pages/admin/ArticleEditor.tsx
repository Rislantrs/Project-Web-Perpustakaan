import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { saveArticle, Article, getArticles } from '../../services/dataService';
import { uploadImage } from '../../services/storageService';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { supabase } from '../../services/supabase';
import { 
  Bold, Italic, Strikethrough, Heading1, Heading2, 
  List, ListOrdered, Quote, Image as ImageIcon, Save, ArrowLeft, Maximize2,
  AlignCenter, AlignLeft, AlignRight, Type, Loader2
} from 'lucide-react';

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Berita Terkini');
  const [excerpt, setExcerpt] = useState('');
  const [coverImg, setCoverImg] = useState('');
  const [imgPosition, setImgPosition] = useState('center');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isUploading, setIsUploading] = useState(false);

  const toIndoDate = (isoStr: string) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const d = new Date(isoStr);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const fromIndoDate = (indoStr: string) => {
    if (!indoStr || typeof indoStr !== 'string') return new Date().toISOString().split('T')[0];
    const months: {[key: string]: string} = {
      'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04', 'Mei': '05', 'Juni': '06',
      'Juli': '07', 'Agustus': '08', 'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
    };
    const parts = indoStr.split(' ');
    if (parts.length !== 3) return new Date().toISOString().split('T')[0];
    const day = parts[0].padStart(2, '0');
    const month = months[parts[1]] || '01';
    const year = parts[2];
    return `${year}-${month}-${day}`;
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl shadow-md mx-auto max-w-full h-auto border border-gray-100 my-8 block',
        },
      }),
      Placeholder.configure({
        placeholder: 'Mulai menulis kisah Anda di sini...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg prose-slate focus:outline-none max-w-none min-h-[400px] prose-img:mx-auto prose-img:rounded-2xl',
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        const images = items.filter(item => item.type.startsWith('image'));
        
        if (images.length > 0) {
          event.preventDefault();
          setIsUploading(true);
          
          Promise.all(images.map(async (item) => {
            const file = item.getAsFile();
            if (file) {
              const imageUrl = await uploadImage(file);
              const { schema } = view.state;
              const node = schema.nodes.image.create({ src: imageUrl });
              const transaction = view.state.tr.replaceSelectionWith(node);
              view.dispatch(transaction);
            }
          })).finally(() => setIsUploading(false));
          
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (id) {
      const fetchFullForEdit = async () => {
        try {
          const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('id', id)
            .single();

          if (data && !error) {
            setTitle(data.title || '');
            setCategory(data.category || 'Umum');
            setExcerpt(data.excerpt || '');
            setCoverImg(data.img || null);
            setImgPosition(data.imgPosition || 'center');
            setDate(fromIndoDate(data.date));
            
            if (editor && data.content) {
              editor.commands.setContent(data.content);
            }
          } else {
             // Fallback
             const allArgs = getArticles();
             const article = allArgs.find(a => a.id === id);
             if (article) {
               setTitle(article.title);
               setCategory(article.category);
               setExcerpt(article.excerpt);
               setCoverImg(article.img);
               setImgPosition(article.imgPosition || 'center');
               setDate(fromIndoDate(article.date));
               if (editor && article.content) {
                 editor.commands.setContent(article.content);
               }
             }
          }
        } catch (err) {
          console.error("Gagal load artikel full:", err);
        }
      };
      fetchFullForEdit();
    }
  }, [id, editor]);

  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      showToast("Judul tidak boleh kosong", "error");
      return;
    }

    setIsUploading(true);
    try {
      const content = editor?.getHTML() || '';
      
      if (content.includes('data:image/') && content.length > 500000) {
        showToast("⚠️ Masih ada gambar Base64 raksasa. Mohon upload ulang gambar.", "error");
        setIsUploading(false);
        return;
      }

      await saveArticle({
        id: id,
        title,
        category,
        excerpt,
        img: coverImg || undefined,
        imgPosition,
        date: toIndoDate(date),
        content: content,
      });
      
      showToast("✅ Berhasil disimpan ke Cloud!", "success");
      setTimeout(() => navigate('/admin/articles'), 1500);
    } catch (err: any) {
      console.error(err);
      showToast("❌ Gagal Simpan ke Cloud. Cek SQL & Internet Mas.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const addImageToEditor = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      setIsUploading(true);
      try {
        const imageUrl = await uploadImage(file);
        editor.chain().focus().setImage({ src: imageUrl }).run();
      } finally {
        setIsUploading(false);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addCaptionPlaceholder = () => {
    if (editor) {
      editor.chain().focus()
        .insertContent('<p style="text-align: center; font-size: 13px; color: #9ca3af; font-style: italic; margin-top: -12px;">Keterangan gambar di sini...</p>')
        .run();
    }
  };

  const changeCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const imageUrl = await uploadImage(file);
        setCoverImg(imageUrl);
      } finally {
        setIsUploading(false);
      }
    }
  };

  if (!editor) return null;

  return (
    <div className="max-w-4xl mx-auto pb-24">
      
      {/* Top Action Bar - Sekarang Lengket (Sticky) */}
      <div className="sticky top-0 z-[60] -mx-4 px-4 py-4 bg-[#fcfdfd]/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between mb-8">
        <button 
          disabled={isUploading}
          onClick={() => navigate('/admin/articles')}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <div className="flex items-center gap-3">
            <button 
              disabled={isUploading}
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#0c2f3d] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#164153] shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
              {isUploading ? 'Memproses...' : 'Simpan & Publikasi'}
            </button>
        </div>
      </div>

      {isUploading && (
        <div className="fixed inset-0 z-[100] bg-black/10 backdrop-blur-[2px] flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
                <Loader2 size={32} className="text-[#d6a54a] animate-spin" />
                <p className="text-sm font-bold text-gray-700">Mengunggah Gambar ke Cloud...</p>
            </div>
        </div>
      )}

      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        
        {/* Cover Image Section */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-500 mb-2">Gambar Sampul</label>
          {coverImg ? (
            <div className="relative group rounded-xl overflow-hidden aspect-video max-w-2xl bg-gray-100 flex flex-col">
              <div className="flex-1 overflow-hidden relative">
                <img 
                  src={coverImg} 
                  alt="Cover" 
                  className="w-full h-full object-cover transition-all" 
                  style={{ objectPosition: imgPosition }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm shadow-sm hover:bg-gray-50">
                    Ganti Gambar
                    <input type="file" accept="image/*" className="hidden" onChange={changeCoverImage} />
                  </label>
                </div>
              </div>
              
              <div className="bg-gray-50 border-t border-gray-100 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-lg bg-[#0c2f3d] flex items-center justify-center text-white">
                        <Maximize2 size={16} />
                     </div>
                     <div>
                       <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Fokus Gambar</h4>
                       <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Geser untuk menyesuaikan bagian yang tampil</p>
                     </div>
                   </div>
                   <span className="text-xs font-black text-[#d6a54a] bg-[#d6a54a]/10 px-3 py-1 rounded-full">{imgPosition === 'center' ? '50%' : imgPosition.split(' ')[1]}</span>
                </div>
                
                <div className="relative h-2 flex items-center group/slider">
                  <div className="absolute inset-0 bg-gray-200 rounded-full h-1"></div>
                  <input 
                    type="range" min="0" max="100" step="1"
                    value={imgPosition === 'center' ? 50 : parseInt(imgPosition.split(' ')[1])}
                    onChange={(e) => setImgPosition(`center ${e.target.value}%`)}
                    className="absolute inset-x-0 w-full h-1 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#0c2f3d] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white group-hover/slider:[&::-webkit-slider-thumb]:scale-125 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center justify-center w-full max-w-2xl aspect-video border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <ImageIcon className="text-gray-400 mb-2" size={32} />
              <span className="text-sm font-medium text-gray-500">Klik untuk unggah gambar sampul</span>
              <input type="file" accept="image/*" className="hidden" onChange={changeCoverImage} />
            </label>
          )}
        </div>

        {/* Metadata Controls */}
        <div className="space-y-6 mb-8">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Ringkasan Singkat</label>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${excerpt.length >= 230 ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                {excerpt.length} / 250
              </span>
            </div>
            <textarea 
              rows={2}
              maxLength={250}
              placeholder="Tulis ringkasan narasi yang akan muncul di daftar berita..." 
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              className="w-full px-5 py-4 border border-gray-200 rounded-2xl text-base focus:outline-none focus:border-[#d6a54a] transition-all bg-gray-50/30 font-serif leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Kategori Artikel</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="w-full px-5 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d6a54a] bg-white"
              >
                <option value="Berita Terkini">Berita Terkini</option>
                <option value="Kedinasan">Kedinasan</option>
                <option value="Pojok Carita">Pojok Carita</option>
                <option value="Perpustakaan Keliling">Perpus Keliling</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tanggal Rilis</label>
              <input 
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-5 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d6a54a] bg-white h-[46px]"
              />
            </div>
          </div>
        </div>

        {/* Title Input */}
        <input
          type="text"
          placeholder="Judul Artikel"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full text-4xl md:text-5xl font-serif font-bold text-gray-900 border-none focus:outline-none focus:ring-0 placeholder:text-gray-300 mb-8 p-0"
        />

        {/* Tiptap Toolbar - Lengket di bawah Top Bar */}
        <div className="sticky top-20 z-40 flex flex-wrap items-center gap-1 bg-white/90 backdrop-blur-sm border border-gray-200 p-2 rounded-xl mb-6 shadow-sm">
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-100 text-[#0c2f3d]' : 'text-gray-600'}`}>
            <Bold size={18} />
          </button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-100 text-[#0c2f3d]' : 'text-gray-600'}`}>
            <Italic size={18} />
          </button>
          
          <div className="w-px h-6 bg-gray-200 mx-1"></div>
          
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded-lg hover:bg-gray-100 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-100 text-[#0c2f3d]' : 'text-gray-600'}`}>
            <Heading1 size={18} />
          </button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded-lg hover:bg-gray-100 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-100 text-[#0c2f3d]' : 'text-gray-600'}`}>
            <Heading2 size={18} />
          </button>
          
          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          {/* Alignment Controls */}
          <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-2 rounded-lg hover:bg-gray-100 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100 text-[#0c2f3d]' : 'text-gray-600'}`}>
            <AlignLeft size={18} />
          </button>
          <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-2 rounded-lg hover:bg-gray-100 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100 text-[#0c2f3d]' : 'text-gray-600'}`}>
            <AlignCenter size={18} />
          </button>
          <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-2 rounded-lg hover:bg-gray-100 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-100 text-[#0c2f3d]' : 'text-gray-600'}`}>
            <AlignRight size={18} />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-100 text-[#0c2f3d]' : 'text-gray-600'}`}>
            <List size={18} />
          </button>
          <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-100 text-[#0c2f3d]' : 'text-gray-600'}`}>
            <ListOrdered size={18} />
          </button>
          
          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          <label className="p-2 cursor-pointer text-gray-600 hover:text-[#0c2f3d] hover:bg-gray-100 rounded-lg transition-colors group relative">
            <ImageIcon size={18} />
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={addImageToEditor} />
          </label>

          {/* Caption Button */}
          <button 
            onClick={addCaptionPlaceholder} 
            className="p-2 text-gray-600 hover:text-[#0c2f3d] hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
            title="Tambah Keterangan Gambar"
          >
            <Type size={16} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Caption</span>
          </button>
        </div>

        {/* Editor Instance */}
        <div className="min-h-[500px]">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Elegant Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 10 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-white ${
              toast.type === 'success' ? 'bg-[#0c2f3d]' : 'bg-red-500'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
