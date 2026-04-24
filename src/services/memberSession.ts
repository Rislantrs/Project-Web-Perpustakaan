import type { Member } from './db';

const CURRENT_USER_KEY = 'disipusda_current_user';

type CurrentMemberSession = {
  member: Member;
  expiresAt?: number;
};

export const saveCurrentMember = (member: Member, expiresAt?: number): void => {
  const payload: CurrentMemberSession = expiresAt ? { member, expiresAt } : { member };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(payload));
};

export const getSavedCurrentMember = (): Member | null => {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Member | CurrentMemberSession;

    if (parsed && 'member' in parsed) {
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
  localStorage.removeItem(CURRENT_USER_KEY);
};
