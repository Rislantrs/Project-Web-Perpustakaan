/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_ENABLE_SECURITY_MONITORING?: string
  readonly VITE_SECURITY_OBSERVABILITY_ENDPOINT?: string
  readonly VITE_SECURITY_ALERTS_TABLE?: string
  readonly VITE_ENABLE_REALTIME?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_GA_MEASUREMENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
