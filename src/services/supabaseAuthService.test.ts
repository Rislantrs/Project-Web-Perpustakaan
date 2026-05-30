import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@supabase/supabase-js';

vi.mock('./supabase', () => {
  const signInWithPasswordMock = vi.fn();
  const verifyOtpMock = vi.fn();
  const setSessionMock = vi.fn();
  const exchangeCodeForSessionMock = vi.fn();

  // expose mocks on globalThis so tests can adjust behaviour after hoisting
  (globalThis as any).__signInWithPasswordMock = signInWithPasswordMock;
  (globalThis as any).__verifyOtpMock = verifyOtpMock;
  (globalThis as any).__setSessionMock = setSessionMock;
  (globalThis as any).__exchangeCodeForSessionMock = exchangeCodeForSessionMock;

  return {
    supabase: {
      auth: {
        signInWithPassword: signInWithPasswordMock,
        verifyOtp: verifyOtpMock,
        setSession: setSessionMock,
        exchangeCodeForSession: exchangeCodeForSessionMock,
      },
      from: vi.fn(() => ({
        upsert: vi.fn().mockResolvedValue({ error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null, count: 1 }),
      })),
    },
  };
});

vi.mock('./db', async () => {
  const actual = await vi.importActual<typeof import('./db')>('./db');
  const dbGetMock = vi.fn();
  const dbSaveMock = vi.fn();
  dbGetMock.mockReturnValue([]);
  (globalThis as any).__dbGetMock = dbGetMock;
  (globalThis as any).__dbSaveMock = dbSaveMock;
  (globalThis as any).__dbSaveMock = dbSaveMock;
  return {
    ...actual,
    dbGet: dbGetMock,
    dbSave: dbSaveMock,
  };
});

vi.mock('./memberSession', () => {
  const saveCurrentMemberMock = vi.fn();
  (globalThis as any).__saveCurrentMemberMock = saveCurrentMemberMock;
  return {
    saveCurrentMember: saveCurrentMemberMock,
  };
});

import { consumeAuthCallbackFromLink, loginWithSupabase, verifyAuthCallbackTokenHash } from './supabaseAuthService';

const fakeUser = {
  id: 'user-1',
  email: 'member@test.id',
  user_metadata: { namaLengkap: 'Member Test' },
} as unknown as User;

describe('supabaseAuthService auth critical flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).__dbGetMock.mockReturnValue([]);
  });

  it('memberi flag needsVerification saat login gagal karena email belum verifikasi', async () => {
    (globalThis as any).__signInWithPasswordMock.mockResolvedValue({
      data: { user: null },
      error: { message: 'Email not confirmed' },
    });

    const result = await loginWithSupabase('member@test.id', 'secret');

    expect(result.success).toBe(false);
    expect(result.needsVerification).toBe(true);
    expect(result.email).toBe('member@test.id');
  });

  it('mengembalikan error callback token hash dengan type yang benar', async () => {
    (globalThis as any).__verifyOtpMock.mockResolvedValue({
      data: { user: null },
      error: { message: 'Token invalid or expired' },
    });

    const result = await verifyAuthCallbackTokenHash('bad-token', 'signup');

    expect(result.success).toBe(false);
    expect(result.type).toBe('signup');
    expect(result.message).toContain('invalid');
  });

  it('memulihkan sesi dari link callback access token', async () => {
    (globalThis as any).__setSessionMock.mockResolvedValue({
      data: { user: fakeUser },
      error: null,
    });

    const result = await consumeAuthCallbackFromLink(
      'https://example.com/auth/callback#access_token=acc123&refresh_token=ref456&type=magiclink',
    );

    expect(result.success).toBe(true);
    expect(result.type).toBe('magiclink');
    expect((globalThis as any).__setSessionMock).toHaveBeenCalledWith({
      access_token: 'acc123',
      refresh_token: 'ref456',
    });
    expect((globalThis as any).__saveCurrentMemberMock).toHaveBeenCalledTimes(1);
    expect((globalThis as any).__dbSaveMock).toHaveBeenCalled();
  });
});
