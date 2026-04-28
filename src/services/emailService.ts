import { supabase } from './supabase';

export type BorrowNotificationPayload = {
  borrowId: string;
};

type EdgeFunctionResponse<T = Record<string, unknown>> = {
  success: boolean;
  message: string;
  data?: T;
};

export const sendBorrowConfirmationEmail = async (
  payload: BorrowNotificationPayload,
): Promise<EdgeFunctionResponse> => {
  const { data, error } = await supabase.functions.invoke('send-borrow-notification', {
    body: payload,
  });

  if (error) {
    return {
      success: false,
      message: error.message || 'Gagal memanggil layanan notifikasi email.',
    };
  }

  return {
    success: true,
    message: (data as EdgeFunctionResponse | null)?.message || 'Email konfirmasi berhasil diproses.',
    data: data as Record<string, unknown>,
  };
};

// Opsional: endpoint ini dipanggil oleh Cron harian. Tetap disediakan agar bisa dites manual dari admin UI.
export const runDailyBorrowReminderJob = async (): Promise<EdgeFunctionResponse> => {
  const { data, error } = await supabase.functions.invoke('send-borrow-reminders', {
    body: {},
  });

  if (error) {
    return {
      success: false,
      message: error.message || 'Gagal menjalankan job pengingat harian.',
    };
  }

  return {
    success: true,
    message: (data as EdgeFunctionResponse | null)?.message || 'Job pengingat harian berhasil dijalankan.',
    data: data as Record<string, unknown>,
  };
};
