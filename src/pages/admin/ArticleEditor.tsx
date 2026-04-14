import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { saveArticle, fileToBase64, Article, getArticles } from '../../services/dataService';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, Italic, Strikethrough, Heading1, Heading2, 
  List, ListOrdered, Quote, Image as ImageIcon, Save, ArrowLeft, Maximize2 
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

  // Setup Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({
        placeholder: 'Mulai menulis kisah Anda di sini...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg prose-slate focus:outline-none max-w-none min-h-[400px]',
      },
    },
  });

  useEffect(() => {
    if (id) {
      const allArgs = getArticles();
      const article = allArgs.find(a => a.id === id);
      if (article) {
        setTitle(article.title);
        setCategory(article.category);
        setExcerpt(article.excerpt);
        setCoverImg(article.img);
        setImgPosition(article.imgPosition || 'center');
        if (editor) {
          editor.commands.setContent(article.content);
        }
      }
    }
  }, [id, editor]);

  const handleSave = () => {
    if (!title.trim()) {
      alert("Judul tidak boleh kosong");
      return;
    }
    
    saveArticle({
      id: id,
      title,
      category,
      excerpt,
      img: coverImg || undefined,
      imgPosition,
      content: editor?.getHTML(),
    });
    
    navigate('/admin/articles');
  };

  const addImageToEditor = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      if (editor) {
        editor.chain().focus().setImage({ src: base64 }).run();
      }
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const changeCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setCoverImg(base64);
    }
  };

  if (!editor) return null;

  return (
    <div className="max-w-4xl mx-auto pb-24">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <button 
          onClick={() => navigate('/admin/articles')}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#0c2f3d] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#164153] shadow-sm transition-all hover:shadow"
        >
          <Save size={16} /> Simpan & Publikasi
        </button>
      </div>

      {/* Editor Canvas (Medium Style) */}
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        
        {/* Cover Image */}
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
              
              {/* Refined Image Focus UI */}
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
                   <span className="text-xs font-black text-[#d6a54a] bg-[#d6a54a]/10 px-3 py-1 rounded-full">
                     {imgPosition === 'center' ? '50%' : imgPosition.split(' ')[1]}
                   </span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Kategori</label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 focus:ring-0"
            >
              <option value="Berita Terkini">Berita Terkini</option>
              <option value="Pojok Carita">Pojok Carita</option>
              <option value="Perpustakaan Keliling">Perpustakaan Keliling</option>
              <option value="Serba-Serbi Purwakarta">Serba-Serbi Purwakarta</option>
              <option disabled>──────────</option>
              <option value="Kedinasan">Artikel - Kedinasan</option>
              <option value="Edukasi">Artikel - Edukasi</option>
              <option value="Statistik">Artikel - Statistik</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Ringkasan (Tampil di Daftar)</label>
            <input 
              type="text" 
              placeholder="Tulis ringkasan singkat..." 
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 focus:ring-0"
            />
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

        {/* Tiptap Toolbar */}
        <div className="sticky top-4 z-10 flex flex-wrap items-center gap-1 bg-white/90 backdrop-blur-sm border border-gray-200 p-2 rounded-xl mb-6 shadow-sm">
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-100 text-[#0c2f3d]' : 'text-gray-600'}`}>
            <Bold size={18} />
          </button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-100 text-[#0c2f3d]' : 'text-gray-600'}`}>
            <Italic size={18} />
          </button>
          <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${editor.isActive('strike') ? 'bg-gray-100 text-[#0c2f3d]' : 'text-gray-600'}`}>
            <Strikethrough size={18} />
          </button>
          
          <div className="w-px h-6 bg-gray-200 mx-1"></div>
          
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded-lg hover:bg-gray-100 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-100 text-[#0c2f3d]' : 'text-gray-600'}`}>
            <Heading1 size={18} />
          </button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded-lg hover:bg-gray-100 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-100 text-[#0c2f3d]' : 'text-gray-600'}`}>
            <Heading2 size={18} />
          </button>
          
          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-100 text-[#0c2f3d]' : 'text-gray-600'}`}>
            <List size={18} />
          </button>
          <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-100 text-[#0c2f3d]' : 'text-gray-600'}`}>
            <ListOrdered size={18} />
          </button>
          <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded-lg hover:bg-gray-100 ${editor.isActive('blockquote') ? 'bg-gray-100 text-[#0c2f3d]' : 'text-gray-600'}`}>
            <Quote size={18} />
          </button>
          
          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          <label className="p-2 cursor-pointer text-gray-600 hover:text-[#0c2f3d] hover:bg-gray-100 rounded-lg transition-colors">
            <ImageIcon size={18} />
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={addImageToEditor} />
          </label>
        </div>

        {/* Editor Instance */}
        <div className="min-h-[500px]">
          <EditorContent editor={editor} />
        </div>

      </div>
    </div>
  );
}
