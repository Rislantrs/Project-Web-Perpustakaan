// Lightweight web-vitals collector (read-only, non-blocking)
// Sends metrics to `VITE_WEB_VITALS_ENDPOINT` via navigator.sendBeacon when configured,
// otherwise logs to console. Designed to be safe and not block page load.
export function initWebVitals() {
  try {
    const endpoint = import.meta.env.VITE_WEB_VITALS_ENDPOINT;

    const send = (name: string, value: unknown) => {
      const payload = JSON.stringify({ name, value, url: location.href, ts: Date.now() });
      if (endpoint && navigator.sendBeacon) {
        try {
          navigator.sendBeacon(endpoint, payload);
        } catch (e) {
          // non-fatal
          // eslint-disable-next-line no-console
          console.warn('web-vitals sendBeacon failed', e);
        }
      } else {
        // Keep logs lightweight in console for debugging
        // eslint-disable-next-line no-console
        console.info('[web-vitals]', name, value);
      }
    };

    // LCP
    if ('PerformanceObserver' in window) {
      const po = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const e = entry as unknown as { entryType?: string; renderTime?: number; startTime?: number };
          if (e.entryType === 'largest-contentful-paint') {
            send('LCP', Math.round(e.renderTime || e.startTime || 0));
          }
        }
      });
      try {
        po.observe({ type: 'largest-contentful-paint', buffered: true } as PerformanceObserverInit);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('LCP observer unavailable', e);
      }

      // CLS
      let cls = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as PerformanceEntry[]) {
          const en = entry as unknown as { hadRecentInput?: boolean; value?: number };
          if (!en.hadRecentInput) cls += en.value || 0;
        }
        send('CLS', Number(cls.toFixed(4)));
      });
      try {
        clsObserver.observe({ type: 'layout-shift', buffered: true } as PerformanceObserverInit);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('CLS observer unavailable', e);
      }

      // FID (first-input) via PerformanceObserver if available
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as PerformanceEntry[]) {
            const en = entry as unknown as { processingStart?: number; startTime?: number };
            send('FID', Math.round((en.processingStart || 0) - (en.startTime || 0)));
          }
        });
        fidObserver.observe({ type: 'first-input', buffered: true } as PerformanceObserverInit);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('FID observer unavailable', e);
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('initWebVitals failed', err);
  }
}

export default initWebVitals;
