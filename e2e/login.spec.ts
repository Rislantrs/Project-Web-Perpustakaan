import { test, expect } from '@playwright/test';

test('halaman login memuat komponen inti', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: 'Masuk ke Akun Anda' })).toBeVisible();
  await expect(page.getByPlaceholder('Masukkan email terdaftar')).toBeVisible();
  await expect(page.getByPlaceholder('••••••••')).toBeVisible();
});

test('validasi form login menolak submit kosong', async ({ page }) => {
  await page.goto('/login');

  const submitButton = page.getByRole('button', { name: /Masuk/i });
  await expect(submitButton).toBeEnabled({ timeout: 7000 });

  await submitButton.click();

  await expect(page.locator('text=Harap isi semua field.')).toBeVisible();
});
