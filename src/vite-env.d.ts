/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_ENABLE_SECURITY_MONITORING?: string
  readonly VITE_SECURITY_OBSERVABILITY_ENDPOINT?: string
  readonly VITE_SECURITY_ALERTS_TABLE?: string
  readonly VITE_ENABLE_REALTIME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
