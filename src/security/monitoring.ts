import type { SupabaseClient } from '@supabase/supabase-js';

type SecurityEventPayload = {
  type: 'csp_violation' | 'auth_failure';
  severity: 'medium' | 'high';
  details: Record<string, unknown>;
  created_at: string;
};

declare global {
  interface Window {
    __securityMonitoringInstalled?: boolean;
    __securityMonitoringOriginalFetch?: typeof fetch;
  }
}

const monitoringEnabled = import.meta.env.VITE_ENABLE_SECURITY_MONITORING !== 'false';
const observabilityEndpoint = import.meta.env.VITE_SECURITY_OBSERVABILITY_ENDPOINT;
// Opt-in: hanya kirim ke tabel Supabase jika env di-set 'true'.
// Ini mencegah spam 400 ketika tabel/policy security_alerts belum siap.
const writeToSupabaseAlerts = import.meta.env.VITE_SECURITY_ALERTS_TABLE === 'true';

const shouldReportAuthFailure = (url: string, status: number) => {
  if (status !== 401 && status !== 403) return false;

  // Batasi ke endpoint cloud agar tidak noisy untuk aset statis.
  const targets = ['supabase.co', '/rest/v1/', '/auth/v1/', '/storage/v1/'];
  return targets.some((token) => url.includes(token));
};

const insertSecurityEvent = async (
  supabase: SupabaseClient,
  payload: SecurityEventPayload
) => {
  if (!writeToSupabaseAlerts) return;

  try {
    await supabase.from('security_alerts').insert(payload);
  } catch {
    // Tetap silent agar monitoring tidak mengganggu UX.
  }
};

export const setupSecurityMonitoring = (supabase: SupabaseClient) => {
  if (!monitoringEnabled) return;
  if (window.__securityMonitoringInstalled) return;
  window.__securityMonitoringInstalled = true;

  window.addEventListener('securitypolicyviolation', (event) => {
    const payload: SecurityEventPayload = {
      type: 'csp_violation',
      severity: 'medium',
      details: {
        blockedURI: event.blockedURI,
        directive: event.violatedDirective,
        source: event.sourceFile,
        disposition: event.disposition,
        statusCode: event.statusCode,
      },
      created_at: new Date().toISOString(),
    };

    // Beacon best-effort untuk endpoint observability bila tersedia.
    if (observabilityEndpoint) {
      try {
        navigator.sendBeacon(
          observabilityEndpoint,
          new Blob([JSON.stringify(payload)], { type: 'application/json' })
        );
      } catch {
        // No-op
      }
    }

    void insertSecurityEvent(supabase, payload);
  });

  const originalFetch = (window.__securityMonitoringOriginalFetch || window.fetch).bind(window);
  window.__securityMonitoringOriginalFetch = originalFetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await originalFetch(input, init);
    const requestUrl = typeof input === 'string' ? input : input.toString();

    if (shouldReportAuthFailure(requestUrl, response.status)) {
      const payload: SecurityEventPayload = {
        type: 'auth_failure',
        severity: 'high',
        details: {
          endpoint: requestUrl,
          method: init?.method || 'GET',
          status: response.status,
        },
        created_at: new Date().toISOString(),
      };

      void insertSecurityEvent(supabase, payload);
    }

    return response;
  };
};