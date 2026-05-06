BEGIN;

-- Ganti nama tipe reminder pengambilan dari 'pickup_h1' (H+1 hari penuh)
-- menjadi 'pickup_6h' (6 jam sebelum batasAmbil).
-- Constraint lama dihapus lalu dibuat ulang agar mencakup nilai baru.
ALTER TABLE public.borrow_notification_logs
  DROP CONSTRAINT IF EXISTS borrow_notification_logs_notification_type_check;

ALTER TABLE public.borrow_notification_logs
  ADD CONSTRAINT borrow_notification_logs_notification_type_check
  CHECK (notification_type IN ('pickup_6h', 'due_h2', 'overdue_daily'));

COMMIT;
