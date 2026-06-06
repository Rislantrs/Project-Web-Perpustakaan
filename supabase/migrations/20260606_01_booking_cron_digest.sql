-- pg_cron setup for daily booking digest
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Unschedule job if exists to avoid duplicates
SELECT cron.unschedule('send-daily-booking-digest');

-- Schedule at 01:00 UTC (08:00 WIB) every day
SELECT cron.schedule(
  'send-daily-booking-digest',
  '0 1 * * *', -- 01:00 UTC (08:00 WIB)
  $$
  SELECT net.http_post(
    url := 'https://anqopdxzdkpsmtxuultp.supabase.co/functions/v1/send-booking-digest',
    headers := '{"Content-Type": "application/json", "x-cron-secret": "YOUR_CRON_SECRET_HERE"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
