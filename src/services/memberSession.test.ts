import { beforeEach, describe, expect, it } from 'vitest';
import { clearCurrentMember, getSavedCurrentMember, saveCurrentMember } from './memberSession';
import type { Member } from './db';

const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
});

const mockMember: Member = {
  id: 'member-1',
  nomorAnggota: 'PWK-2026-1001',
  namaLengkap: 'Member Test',
  nik: '********1234',
  email: 'member@test.id',
  password: 'managed-by-supabase-auth',
  alamat: 'Purwakarta',
  telepon: '081234567890',
  jenisKelamin: 'L',
  tanggalLahir: '2000-01-01',
  tanggalDaftar: '30 Mei 2026',
  avatarColor: '#0c2f3d',
  avatarUrl: '',
  bio: '',
};

describe('memberSession auth flow', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('menyimpan dan mengambil sesi member aktif', () => {
    saveCurrentMember(mockMember);

    const current = getSavedCurrentMember();

    expect(current).not.toBeNull();
    expect(current?.id).toBe(mockMember.id);
    expect(current?.email).toBe(mockMember.email);
  });

  it('menghapus sesi otomatis saat expiresAt terlewati', () => {
    saveCurrentMember(mockMember, Date.now() - 1000);

    const current = getSavedCurrentMember();

    expect(current).toBeNull();
    expect(sessionStorage.getItem('disipusda_current_user')).toBeNull();
  });

  it('clearCurrentMember menghapus sesi manual', () => {
    saveCurrentMember(mockMember);
    clearCurrentMember();

    const current = getSavedCurrentMember();

    expect(current).toBeNull();
  });
});
