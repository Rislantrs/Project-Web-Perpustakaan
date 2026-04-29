import { test, expect } from '@playwright/test';

test('halaman katalog memuat dan menampilkan buku', async ({ page }) => {
  await page.goto('/katalog');
  
  // Memastikan judul halaman benar
  await expect(page.locator('h1')).toContainText('Jelajahi Koleksi Kami');
  
  // Memastikan setidaknya ada kotak pencarian
  const searchInput = page.getByPlaceholder('Cari judul, penulis, atau ISBN...');
  await expect(searchInput).toBeVisible();

  // Memastikan bisa mengetik di kotak pencarian
  await searchInput.fill('Laskar Pelangi');
  await expect(searchInput).toHaveValue('Laskar Pelangi');
});

test('alur login gagal dengan kredensial salah', async ({ page }) => {
  await page.goto('/login');
  
  // Isi form login
  await page.getByPlaceholder('Masukkan email terdaftar').fill('bukanuser@test.com');
  await page.getByPlaceholder('••••••••').fill('salah123');
  
  // Klik tombol submit
  await page.getByRole('button', { name: 'Masuk' }).click();
  
  // Seharusnya muncul pesan error
  await expect(page.locator('text=Email atau password salah')).toBeVisible({ timeout: 5000 });
});
