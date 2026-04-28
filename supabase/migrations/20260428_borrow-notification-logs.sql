BEGIN;

CREATE TABLE IF NOT EXISTS public.borrow_notification_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  borrow_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('pickup_h1', 'due_h2', 'overdue_daily')),
  notification_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reason TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_borrow_notification_once_per_day
  ON public.borrow_notification_logs (borrow_id, notification_type, notification_date);

CREATE INDEX IF NOT EXISTS idx_borrow_notification_member_date
  ON public.borrow_notification_logs (member_id, notification_date DESC);

ALTER TABLE public.borrow_notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "borrow_notification_logs_admin_read" ON public.borrow_notification_logs;
CREATE POLICY "borrow_notification_logs_admin_read"
ON public.borrow_notification_logs
FOR SELECT
TO authenticated
USING (public.is_admin_from_admins());

DROP POLICY IF EXISTS "borrow_notification_logs_admin_insert" ON public.borrow_notification_logs;
CREATE POLICY "borrow_notification_logs_admin_insert"
ON public.borrow_notification_logs
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_from_admins());

COMMIT;
