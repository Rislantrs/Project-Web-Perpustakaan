import type { Member } from './db';

const CURRENT_USER_KEY = 'disipusda_current_user';
// Kunci tunggal sesi member agar konsisten dipakai lintas service/auth flow.

type CurrentMemberSession = {
  member: Member;
  expiresAt?: number;
};

export const saveCurrentMember = (member: Member, expiresAt?: number): void => {
  // Menggunakan sessionStorage untuk memitigasi risiko persistensi serangan XSS.
  const payload: CurrentMemberSession = expiresAt ? { member, expiresAt } : { member };
  sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(payload));
};

export const getSavedCurrentMember = (): Member | null => {
  try {
    const raw = sessionStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Member | CurrentMemberSession;

    if (parsed && 'member' in parsed) {
      // Auto purge sesi kadaluarsa supaya user tidak dianggap login permanen.
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        clearCurrentMember();
        return null;
      }
      return parsed.member?.id ? parsed.member : null;
    }

    return parsed && (parsed as Member).id ? (parsed as Member) : null;
  } catch {
    return null;
  }
};

export const clearCurrentMember = (): void => {
  sessionStorage.removeItem(CURRENT_USER_KEY);
};
