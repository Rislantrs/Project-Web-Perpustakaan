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
    headers := '{"Content-Type": "application/json", "x-cron-secret": "b652d4a3fdcb6f6473ea38a1fa53d146411d21a083bce00ea430603c3d4d6da7"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
