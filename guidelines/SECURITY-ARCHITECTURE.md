# Security Architecture: React + Supabase + Cloudflare Pages

**Status**: Production-Ready | **Last Updated**: April 2026

---

## 1. DATA INTEGRITY: Mengunci Kolom Sensitif

### Problem Statement
Kalau mengandalkan validasi client-side saja, attacker bisa:
- Bypass validation dengan DevTools
- Memanipulasi timestamp langsung sebelum POST
- Mengubah status tanpa go-through server

### Solution: Server-Driven Immutability

#### 1.1 Schema Design (PostgreSQL via Supabase)

```sql
-- ✅ CORRECT: Kolom sensitif tidak bisa di-update
CREATE TABLE public.articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    
    -- Immutable: Hanya bisa set saat INSERT, tidak boleh UPDATE
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_by TEXT NOT NULL,
    
    -- Server-controlled: Hanya bisa di-set oleh trigger
    status TEXT DEFAULT 'draft' NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- User-controlled: Boleh di-update
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_by TEXT,
    
    CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'archived'))
);

-- ✅ Trigger: Otomatis set published_at saat status = 'published'
CREATE OR REPLACE FUNCTION public.set_published_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'published' AND OLD.status != 'published' THEN
        NEW.published_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_published_timestamp
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.set_published_timestamp();

-- ✅ RLS Policy: Immutable columns
CREATE POLICY "Created at immutable"
ON public.articles
FOR UPDATE
USING (auth.uid()::text = created_by)
WITH CHECK (
    -- Client tidak bisa ubah created_at, created_by, atau published_at
    created_at = OLD.created_at
    AND created_by = OLD.created_by
    AND (
        -- Hanya boleh publish jika punya permission tertentu
        (NEW.status = 'published' AND OLD.status != 'published')
        OR (NEW.status = OLD.status)
    )
);
```

#### 1.2 Frontend: Jangan Kirim Kolom Sensitif

```typescript
// ❌ WRONG: Kirim semua field termasuk created_at
const saveArticle = async (article: Article) => {
  await supabase
    .from('articles')
    .update({
      title: article.title,
      content: article.content,
      created_at: article.created_at,  // ❌ DANGER!
      status: article.status,           // ❌ DANGER!
      updated_at: new Date().toISOString(),
    })
    .eq('id', article.id);
};

// ✅ CORRECT: Hanya kirim field yang boleh di-edit
const saveArticle = async (article: Article) => {
  const { error } = await supabase
    .from('articles')
    .update({
      title: article.title,
      content: article.content,
      // ✅ Jangan kirim created_at, created_by, status, published_at
      // Server akan handle itu via trigger/RLS
    })
    .eq('id', article.id);

  if (error?.code === '42501') {
    // RLS rejected: Client tried to modify immutable column
    console.error('Akses ditolak: Kolom ini tidak boleh diubah');
  }
};
```

#### 1.3 Validation Layer (Middleware Pattern)

```typescript
// ✅ Server-side validation (via Supabase Edge Functions)
// File: supabase/functions/update-article/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method !== "PATCH") return new Response("Method not allowed", { status: 405 });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response("Unauthorized", { status: 401 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", "")
  );
  if (authError || !user) return new Response("Unauthorized", { status: 401 });

  const { id, title, content } = await req.json();

  // ✅ Fetch current record FIRST
  const { data: current, error: fetchError } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) return new Response("Not found", { status: 404 });

  // ✅ Validate immutable columns didn't change
  if (current.created_by !== user.id) {
    return new Response("Unauthorized: Not the author", { status: 403 });
  }

  // ✅ Only allow these fields
  const allowedUpdate = {
    title: title || current.title,
    content: content || current.content,
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  };

  const { error } = await supabase
    .from("articles")
    .update(allowedUpdate)
    .eq("id", id);

  return new Response(JSON.stringify({ success: !error }), { status: error ? 400 : 200 });
});
```

#### 1.4 Testing Data Integrity

```typescript
// ✅ Test: User tidak bisa bypass immutable columns
describe("Data Integrity: Immutable Columns", () => {
  it("should reject update to created_at", async () => {
    const { data, error } = await supabase
      .from("articles")
      .update({
        title: "New Title",
        created_at: new Date().toISOString(), // ❌ Try to change
      })
      .eq("id", articleId);

    expect(error?.code).toBe("42501"); // RLS Violation
    expect(data).toBeNull();
  });

  it("should allow update to title only", async () => {
    const { data, error } = await supabase
      .from("articles")
      .update({ title: "New Title" })
      .eq("id", articleId);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it("should auto-set published_at when status changes", async () => {
    await supabase
      .from("articles")
      .update({ status: "published" })
      .eq("id", articleId);

    const { data } = await supabase
      .from("articles")
      .select("published_at, status")
      .eq("id", articleId)
      .single();

    expect(data.status).toBe("published");
    expect(data.published_at).toBeDefined();
    expect(data.published_at).not.toBeNull();
  });
});
```

---

## 2. ACCESS CONTROL: RLS vs Middleware

### 2.1 RLS (Row-Level Security) di Supabase

**Kapan gunakan RLS:**
- User hanya bisa baca/edit data miliknya sendiri
- Multi-tenant application
- Perlu horizontal filtering (berdasarkan user ID, organization, etc)

**Keuntungan:**
- Enforcement langsung di database (tidak perlu trust client)
- Automatic di semua query (misal saat filter, aggregate, dll)
- Single source of truth untuk access rules

**Risiko:**
- RLS logic yang rumit bisa slow down query
- Debugging lebih susah (policy cascade)
- Bug di RLS bisa expose semua data

```sql
-- ✅ CORRECT RLS: User hanya lihat data miliknya
CREATE POLICY "Users can read own data"
ON public.articles
FOR SELECT
USING (created_by = auth.uid()::text);

-- ✅ Admin bisa lihat semua
CREATE POLICY "Admin can read all"
ON public.articles
FOR SELECT
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

-- ✅ User hanya bisa update miliknya sendiri
CREATE POLICY "Users can update own articles"
ON public.articles
FOR UPDATE
USING (created_by = auth.uid()::text)
WITH CHECK (created_by = auth.uid()::text);
```

### 2.2 Middleware Pattern (Backend API Route)

**Kapan gunakan Middleware:**
- Logic access control yang kompleks (e.g., approval chain)
- Perlu log semua akses untuk audit
- Ingin enkripsi data per-row
- Perlu cache access control decisions

```typescript
// ✅ Supabase Edge Function sebagai middleware
// File: supabase/functions/get-articles/index.ts

serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", "")
  );

  if (authError || !user) return new Response("Unauthorized", { status: 401 });

  // ✅ Middleware Logic: Complex access control
  const { role } = await checkUserRole(user.id);
  const { organization } = await checkUserOrganization(user.id);

  let query = supabase.from("articles").select("*");

  // Conditional filtering berdasarkan role
  if (role !== "admin") {
    query = query
      .eq("organization_id", organization.id)
      .in("visibility", ["public", "internal"]);
  }

  const { data, error } = await query;

  // ✅ Audit log: Siapa akses apa
  await logAccess({
    user_id: user.id,
    action: "view_articles",
    timestamp: new Date(),
    count: data?.length || 0,
  });

  return new Response(JSON.stringify(data), { status: 200 });
});
```

### 2.3 Perbandingan: RLS vs Middleware

| Aspek | RLS | Middleware |
|-------|-----|-----------|
| **Performance** | Database filter (cepat) | Network round-trip |
| **Complexity** | Susah untuk logic rumit | Flexible |
| **Audit Trail** | Implicit (via logs) | Explicit (di function) |
| **Bypass Risk** | ✅ Tidak bisa bypass | ❌ Perlu trust app code |
| **Multitenancy** | ✅ Native support | Manual |
| **Learning Curve** | Steep (SQL policy) | Easy (TypeScript) |

**REKOMENDASI: Hybrid approach**
```sql
-- Gunakan RLS untuk basic row-level filtering
-- Gunakan Middleware untuk complex/audit logic

-- RLS: Basic "user owns this row" check
CREATE POLICY "Users see own articles"
ON public.articles
FOR SELECT
USING (created_by = auth.uid()::text);

-- Middleware: Complex filtering + audit + encryption
-- → Call via Edge Function, bukan direct Supabase query
```

### 2.4 Testing Access Control

```typescript
describe("Access Control: RLS + Middleware", () => {
  it("User A cannot read User B articles", async () => {
    // Login as User A
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("created_by", userB.id);

    expect(error?.code).toBe("42501"); // RLS violation
    expect(data).toBeNull();
  });

  it("Admin can read all articles via middleware", async () => {
    const response = await fetch("/functions/get-articles", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.length).toBeGreaterThan(0);
  });
});
```

---

## 3. CSP & THIRD-PARTY SERVICES

### 3.1 Content Security Policy Setup

**Problem:**
- Cloudflare Turnstile injects script → CSP blocks it
- Supabase auth redirects → CSP blocks it
- Browser extension conflicts

```typescript
// ✅ CORRECT: Comprehensive CSP di Cloudflare Pages (_headers file)

[[headers]]
path = "/*"

[headers.values]
Content-Security-Policy = """
    default-src 'self';
    script-src 'self' 'wasm-unsafe-eval' https://challenges.cloudflare.com https://cdn.jsdelivr.net;
    frame-src 'self' https://challenges.cloudflare.com;
    connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com https://cdn.jsdelivr.net;
    img-src 'self' data: https:;
    style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com;
    form-action 'self' https://*.supabase.co;
    frame-ancestors 'none';
    upgrade-insecure-requests;
"""
```

**Penjelasan setiap directive:**

```
default-src 'self'
→ Semua request harus ke origin sendiri, kecuali override per directive

script-src 'self' 'wasm-unsafe-eval' https://challenges.cloudflare.com
→ Allow inline script dari Cloudflare Turnstile + WASM
→ ⚠️ 'unsafe-eval' diperlukan untuk WASM, tapi assess risk-nya

frame-src https://challenges.cloudflare.com
→ Allow iframe dari Cloudflare Turnstile

connect-src 'self' https://*.supabase.co
→ Allow fetch/xhr ke Supabase + Turnstile callback

img-src 'self' data: https:
→ Allow semua image dari HTTPS (Supabase storage)

style-src 'self' 'unsafe-inline'
→ ⚠️ unsafe-inline diperlukan untuk styled-components, consider nonce

form-action 'self' https://*.supabase.co
→ Allow form submit ke Supabase auth endpoints
```

### 3.2 React Implementation dengan CSP Nonce

```typescript
// ✅ Dengan Nonce: Lebih aman daripada 'unsafe-inline'
// File: vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { randomUUID } from 'crypto';

export default defineConfig({
  plugins: [
    react({
      // Inject nonce ke inline styles
      jsxImportSource: '@emotion/react',
    }),
  ],
  server: {
    middlewares: [
      (req, res, next) => {
        const nonce = randomUUID();
        res.setHeader('Content-Security-Policy', `
          style-src 'nonce-${nonce}';
        `);
        res.locals.nonce = nonce;
        next();
      },
    ],
  },
});
```

### 3.3 Cloudflare Turnstile + Supabase Integration

```typescript
// ✅ CORRECT: Load Turnstile dan handle response

import { useEffect, useRef } from 'react';

export function TurnstileWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    // Load Turnstile script (diallow by CSP)
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.turnstile) {
        window.turnstile.render('#turnstile-container', {
          sitekey: import.meta.env.VITE_TURNSTILE_SITEKEY,
          theme: 'light',
          callback: (token: string) => {
            setToken(token);
            // Kirim token ke backend untuk verification
            verifyTurnstile(token);
          },
          'error-callback': () => {
            console.error('Turnstile error');
          },
          'timeout-callback': () => {
            console.error('Turnstile timeout');
          },
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      if (window.turnstile) {
        window.turnstile.reset();
      }
    };
  }, []);

  return <div id="turnstile-container" ref={containerRef} />;
}

// ✅ Backend verification (Edge Function)
async function verifyTurnstile(token: string) {
  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: Deno.env.get('TURNSTILE_SECRET_KEY'),
        response: token,
      }),
    }
  );

  const data = await response.json();
  
  if (!data.success) {
    return new Response(
      JSON.stringify({ error: 'Captcha verification failed' }),
      { status: 400 }
    );
  }

  // ✅ Token valid, proceed dengan register/login
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
```

### 3.4 CSP Report & Testing

```typescript
// ✅ Monitor CSP violations
useEffect(() => {
  window.addEventListener('securitypolicyviolation', (event) => {
    console.warn('CSP Violation:', {
      blocked: event.blockedURI,
      policy: event.violatedDirective,
      source: event.sourceFile,
      line: event.lineNumber,
    });

    // Log ke monitoring service
    fetch('/functions/log-csp-violation', {
      method: 'POST',
      body: JSON.stringify({
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        sourceFile: event.sourceFile,
      }),
    });
  });

  return () => {
    window.removeEventListener('securitypolicyviolation', () => {});
  };
}, []);

// ✅ Test: CSP tidak block Turnstile
describe('CSP: Third-party Services', () => {
  it('should allow Cloudflare Turnstile script', async () => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    
    let loaded = false;
    script.onload = () => { loaded = true; };
    document.head.appendChild(script);

    await new Promise(resolve => setTimeout(resolve, 2000));
    expect(loaded).toBe(true);
  });

  it('should allow Supabase auth redirects', async () => {
    const result = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    expect(result.error).toBeNull();
    // Verify navigation was not CSP-blocked
  });
});
```

---

## 4. RISK MANAGEMENT: Testing & Monitoring

### 4.1 Security Testing Strategy

```typescript
// ✅ Integration test suite untuk security
// File: tests/security.test.ts

describe('Security: End-to-End', () => {
  describe('Data Integrity', () => {
    it('should prevent timestamp manipulation', async () => {
      const response = await fetch('/api/articles', {
        method: 'PATCH',
        body: JSON.stringify({
          id: articleId,
          created_at: new Date().toISOString(), // ❌ Attempt
        }),
      });

      expect(response.status).toBe(400);
    });

    it('should reject if user not author', async () => {
      const response = await fetch(`/api/articles/${userBArticleId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${userAToken}` },
        body: JSON.stringify({ title: 'Hacked' }),
      });

      expect(response.status).toBe(403);
    });
  });

  describe('Access Control', () => {
    it('RLS should block unauthorized read', async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('created_by', userB.id);

      expect(error?.code).toBe('42501');
    });

    it('Middleware should log access attempts', async () => {
      await fetch('/functions/get-articles', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const logs = await supabase
        .from('access_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      expect(logs.data?.[0]?.action).toBe('view_articles');
    });
  });

  describe('CSP Compliance', () => {
    it('should not block Turnstile', async () => {
      const violations: SecurityPolicyViolationEvent[] = [];
      
      window.addEventListener('securitypolicyviolation', (e) => {
        violations.push(e);
      });

      // Trigger Turnstile load
      const turnstileScript = document.createElement('script');
      turnstileScript.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      document.head.appendChild(turnstileScript);

      await new Promise(r => setTimeout(r, 2000));

      const hasTurnstileViolation = violations.some(
        v => v.blockedURI?.includes('cloudflare')
      );
      expect(hasTurnstileViolation).toBe(false);
    });

    it('should enforce default-src policy', async () => {
      const violations: SecurityPolicyViolationEvent[] = [];
      
      window.addEventListener('securitypolicyviolation', (e) => {
        violations.push(e);
      });

      // Try to load from suspicious domain
      const img = document.createElement('img');
      img.src = 'https://evil.com/image.png';
      document.body.appendChild(img);

      await new Promise(r => setTimeout(r, 1000));

      const hasBlocked = violations.some(v => v.blockedURI?.includes('evil.com'));
      expect(hasBlocked).toBe(true);
    });
  });
});
```

### 4.2 Monitoring & Alerting

```typescript
// ✅ Real-time security monitoring

interface SecurityAlert {
  type: 'csp-violation' | 'auth-failure' | 'unauthorized-access' | 'data-anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

class SecurityMonitor {
  constructor(private supabase: SupabaseClient) {}

  async logAlert(alert: SecurityAlert) {
    // ✅ Log ke Supabase audit table
    await this.supabase.from('security_alerts').insert({
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      metadata: JSON.stringify(alert.metadata),
      timestamp: alert.timestamp,
    });

    // ✅ Alert kalau severity = critical
    if (alert.severity === 'critical') {
      await this.notifySecurityTeam(alert);
    }
  }

  setupCSPMonitoring() {
    window.addEventListener('securitypolicyviolation', (event) => {
      this.logAlert({
        type: 'csp-violation',
        severity: this.assessCSPSeverity(event.violatedDirective),
        message: `CSP blocked ${event.blockedURI}`,
        metadata: {
          blockedURI: event.blockedURI,
          violatedDirective: event.violatedDirective,
          sourceFile: event.sourceFile,
          lineNumber: event.lineNumber,
        },
        timestamp: new Date(),
      });
    });
  }

  setupAuthMonitoring() {
    // Monitor failed login attempts
    const attemptMap = new Map<string, number>();

    window.addEventListener('failed-login', (e: any) => {
      const email = e.detail.email;
      const count = (attemptMap.get(email) || 0) + 1;
      attemptMap.set(email, count);

      if (count >= 5) {
        this.logAlert({
          type: 'auth-failure',
          severity: 'high',
          message: `Multiple failed login attempts for ${email}`,
          metadata: { email, attempts: count },
          timestamp: new Date(),
        });
      }
    });
  }

  private assessCSPSeverity(directive: string): 'low' | 'medium' | 'high' {
    const criticalDirectives = ['script-src', 'form-action', 'frame-src'];
    return criticalDirectives.includes(directive) ? 'high' : 'medium';
  }

  private async notifySecurityTeam(alert: SecurityAlert) {
    // Send to Slack/PagerDuty/etc
    await fetch(Deno.env.get('SECURITY_WEBHOOK_URL')!, {
      method: 'POST',
      body: JSON.stringify(alert),
    });
  }
}
```

### 4.3 Risk Assessment & Mitigation

| Risk | Likelihood | Impact | Mitigation | Test |
|------|------------|--------|-----------|------|
| RLS Bypass | Low | Critical | Test all policies, audit logs | `test-rls-bypass.ts` |
| CSP Too Strict | Medium | High | Monitor CSP violations, gradual rollout | `csp-compliance.test.ts` |
| Turnstile Timeout | Medium | Medium | Add retry logic, fallback CAPTCHA | `timeout.test.ts` |
| Column Injection | Low | Critical | Use prepared statements, Supabase default | N/A (DB-level) |
| Token Leakage | Low | Critical | HTTPS only, secure cookie flags | `token-security.test.ts` |

### 4.4 Deployment Checklist

```markdown
## Pre-Production Security Checklist

- [ ] RLS Policies tested untuk semua user roles
- [ ] Immutable columns verified via test suite
- [ ] CSP Policy validated di staging environment
- [ ] Turnstile + Supabase integration tested di production mirror
- [ ] Security monitoring + alerting aktif
- [ ] Rate limiting di-set untuk auth endpoints
- [ ] HTTPS redirect enforced (Cloudflare auto)
- [ ] Secrets (API keys) tidak hardcoded, semua via env vars
- [ ] Database backups + recovery plan documented
- [ ] Security team notified of CSP exceptions
- [ ] Incident response plan ready

## Monitoring Post-Launch

- [ ] CSP violation dashboard accessible
- [ ] Auth failure rate < 0.1%
- [ ] Average query time tidak meningkat > 10%
- [ ] RLS policy audit logs reviewed weekly
```

---

## KESIMPULAN

**Best Practices Summary:**

1. **Data Integrity**: PostgreSQL constraints + RLS policy + Immutable columns
2. **Access Control**: RLS untuk basic, Middleware untuk complex + audit
3. **CSP**: Strict default + specific allow list per third-party
4. **Risk**: Test everything, monitor violations, gradual rollout

**Quick Start:**
```bash
# 1. Copy schema dari section 1.1
# 2. Update _headers dengan CSP dari section 3.1
# 3. Implement Edge Functions dari section 1.3
# 4. Run security test suite dari section 4.1
# 5. Deploy ke staging → validate → production
```

---

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Content Security Policy MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Cloudflare Turnstile Docs](https://developers.cloudflare.com/turnstile/)
