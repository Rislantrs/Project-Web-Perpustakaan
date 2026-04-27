# Security Implementation Checklist

**Target**: Production-ready React + Supabase + Cloudflare Pages security architecture  
**Status**: Ready to implement  
**Estimated Time**: 2-3 days (with testing)

---

## PHASE 1: Database Security (Day 1)

### 1.1 Migration Setup
- [ ] Copy SQL migration dari `supabase/migrations/20260427_security-hardening.sql`
- [ ] Run di Supabase Dashboard → SQL Editor (atau via CLI: `supabase db push`)
- [ ] Verify: Check semua trigger + RLS policy berhasil created (see verification queries di SQL file)

### 1.2 Verify Immutable Columns
```bash
# Run di Supabase SQL Console untuk verify
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'articles';

# Output: should include check_immutable_created_at, check_immutable_created_by
```

### 1.3 Test RLS Policies (Quick)
```sql
-- Cek dari SQL console: pastikan RLS policy aktif
SELECT tablename, policyname, permissive 
FROM pg_policies 
WHERE tablename IN ('articles', 'categories', 'members');

-- Result: harus show semua policy yang di-create di migration
```

---

## PHASE 2: Frontend Implementation (Day 1-2)

### 2.1 Setup Security Service
```bash
# Create security module
mkdir -p src/security
touch src/security/examples.ts
touch src/security/validation.ts
touch src/security/monitoring.ts
```

### 2.2 Implement Immutable Column Guard
```typescript
// Copy dari src/security/examples.ts → ke artikel service kamu
// File: src/services/articleService.ts

import { updateArticleSafe, AllowedArticleUpdates } from '../security/examples';

// Replace semua article update calls dengan:
await updateArticleSafe(supabase, articleId, {
  title: newTitle,
  content: newContent,
  // ✅ TypeScript prevents sending created_at, created_by, etc
});
```

### 2.3 Setup CSP Headers
- [ ] Go to Cloudflare Pages → Settings
- [ ] Atau create `_headers` file in `public/` folder

```
# public/_headers file
[[headers]]
path = "/*"

[headers.values]
Content-Security-Policy = """default-src 'self'; script-src 'self' 'wasm-unsafe-eval' https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com; connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data: https://fonts.gstatic.com; form-action 'self' https://*.supabase.co; frame-ancestors 'none';"""
```

- [ ] Deploy ke Cloudflare Pages
- [ ] Verify via DevTools → Network → check response headers

### 2.4 Implement Security Monitoring
```typescript
// Add to main.tsx (React entry point)
import { setupSecurityMonitoring } from './security/monitoring';
import { supabase } from './services/supabase';

setupSecurityMonitoring(supabase);
// Now CSP violations + auth errors logged to backend
```

---

## PHASE 3: Testing (Day 2-3)

### 3.1 Unit Tests: Immutable Columns
```bash
# Create test file
touch tests/security.immutable.test.ts
```

```typescript
// tests/security.immutable.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { updateArticle } from '../src/services/articleService';
import { createSupabaseClient } from '../src/services/supabase';

describe('Immutable Columns', () => {
  let supabase;
  let testArticleId: string;

  beforeEach(async () => {
    supabase = createSupabaseClient();
    
    // Create test article
    const { data } = await supabase.from('articles').insert({
      title: 'Test Article',
      content: 'Test content',
    }).select().single();
    
    testArticleId = data.id;
  });

  it('should reject update to created_at', async () => {
    const { error } = await supabase
      .from('articles')
      .update({
        title: 'New Title',
        created_at: new Date().toISOString(),
      })
      .eq('id', testArticleId);

    // ✅ Should fail with RLS error
    expect(error?.code).toBe('42501');
  });

  it('should reject update to created_by', async () => {
    const { error } = await supabase
      .from('articles')
      .update({
        created_by: 'hacker-id',
      })
      .eq('id', testArticleId);

    expect(error?.code).toBe('42501');
  });

  it('should allow update to title only', async () => {
    const { data, error } = await supabase
      .from('articles')
      .update({ title: 'New Title' })
      .eq('id', testArticleId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.title).toBe('New Title');
  });

  it('should auto-set updated_at on update', async () => {
    const oldTimestamp = (await supabase
      .from('articles')
      .select('updated_at')
      .eq('id', testArticleId)
      .single()).data.updated_at;

    await new Promise(r => setTimeout(r, 1000)); // Wait 1 sec

    await supabase
      .from('articles')
      .update({ title: 'Updated Title' })
      .eq('id', testArticleId);

    const newRecord = (await supabase
      .from('articles')
      .select('updated_at')
      .eq('id', testArticleId)
      .single()).data;

    // ✅ updated_at should be newer
    expect(new Date(newRecord.updated_at).getTime())
      .toBeGreaterThan(new Date(oldTimestamp).getTime());
  });
});
```

### 3.2 Integration Tests: RLS
```typescript
// tests/security.rls.test.ts
describe('RLS: Access Control', () => {
  it('User A cannot read User B articles', async () => {
    const userASupabase = createClientWithToken(userAToken);
    const userBSupabase = createClientWithToken(userBToken);

    // User B create article
    const { data: bArticle } = await userBSupabase
      .from('articles')
      .insert({ title: 'B Secret Article', created_by: userB.id })
      .select()
      .single();

    // User A try to read
    const { data, error } = await userASupabase
      .from('articles')
      .select('*')
      .eq('created_by', userB.id);

    // ✅ Should be blocked
    expect(error?.code).toBe('42501');
    expect(data).toBeNull();
  });

  it('User can read own articles', async () => {
    const userSupabase = createClientWithToken(userToken);

    const { data: myArticles } = await userSupabase
      .from('articles')
      .select('*');

    // ✅ Should return only user's own articles
    expect(myArticles.every(a => a.created_by === userId)).toBe(true);
  });

  it('Admin can read all articles', async () => {
    const adminSupabase = createClientWithToken(adminToken);

    const { data: allArticles } = await adminSupabase
      .from('articles')
      .select('*');

    // ✅ Should return all articles
    expect(allArticles.length).toBeGreaterThan(1);
  });
});
```

### 3.3 CSP Compliance Test
```typescript
// tests/security.csp.test.ts
describe('CSP Compliance', () => {
  it('should not block Turnstile', async () => {
    const violations: SecurityPolicyViolationEvent[] = [];

    const handler = (event: SecurityPolicyViolationEvent) => {
      violations.push(event);
    };

    window.addEventListener('securitypolicyviolation', handler);

    // Load Turnstile
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    document.head.appendChild(script);

    // Wait for load
    await new Promise(r => setTimeout(r, 3000));

    const turnstileBlocked = violations.some(v =>
      v.blockedURI?.includes('cloudflare.com')
    );

    // ✅ Turnstile should NOT be blocked
    expect(turnstileBlocked).toBe(false);

    window.removeEventListener('securitypolicyviolation', handler);
  });

  it('should block suspicious domains', async () => {
    const violations: SecurityPolicyViolationEvent[] = [];

    window.addEventListener('securitypolicyviolation', (e) => {
      violations.push(e);
    });

    // Try to load from evil domain
    const img = document.createElement('img');
    img.src = 'https://evil.com/image.png';
    document.body.appendChild(img);

    await new Promise(r => setTimeout(r, 1000));

    const evilBlocked = violations.some(v =>
      v.blockedURI?.includes('evil.com')
    );

    // ✅ evil.com should be blocked
    expect(evilBlocked).toBe(true);
  });
});
```

### 3.4 Run All Tests
```bash
# Install vitest (if not present)
npm install -D vitest

# Run tests
npm run test

# Expected output:
# ✓ Immutable Columns (4 tests)
# ✓ RLS: Access Control (3 tests)
# ✓ CSP Compliance (2 tests)
```

---

## PHASE 4: Staging Deployment (Day 3)

### 4.1 Deploy to Staging Environment
```bash
# 1. Deploy to staging branch
git checkout -b staging/security-hardening
git push origin staging/security-hardening

# 2. Cloudflare Pages auto-deploys to staging
# 3. Run full test suite against staging
npm run test:staging
```

### 4.2 Manual Testing Checklist
- [ ] Try to edit article created_at timestamp directly via DevTools → should fail
- [ ] Try to update another user's article → RLS blocks it
- [ ] Create new article → published_at auto-set when status=published
- [ ] Load Turnstile widget → no CSP violations in console
- [ ] Check CSP headers via `curl -I https://staging.example.com`
- [ ] Monitor security alerts dashboard (check audit_logs table)

### 4.3 Performance Testing (Optional)
```bash
# Check if RLS policies add significant latency
npm run test:performance

# Expected: <100ms additional latency for RLS filtering
```

---

## PHASE 5: Production Deployment (Day 3+)

### 5.1 Pre-Deployment Checklist
- [ ] All tests passing (unit + integration + CSP)
- [ ] No new CSP violations logged in staging (24h period)
- [ ] Database migration tested on production backup
- [ ] Incident response plan documented
- [ ] Team aware of new behavior (immutable columns, RLS)

### 5.2 Deployment Steps
```bash
# 1. Merge to main branch
git checkout main
git merge staging/security-hardening --no-ff

# 2. Create release tag
git tag -a v1.2.0 -m "Security Hardening: Immutable Columns + RLS"

# 3. Push to main
git push origin main --tags

# 4. Cloudflare Pages auto-deploys to production
# Monitor: CSP violations + auth errors for 24h

# 5. If critical issue found:
git revert [commit-hash]  # Rollback
```

### 5.3 Post-Deployment Monitoring (7 days)
```typescript
// Monitor dashboard KPIs
const metrics = {
  cspViolations: (count) => console.log(`CSP violations: ${count}`),
  rlsBlockedRequests: (count) => console.log(`RLS blocks: ${count}`),
  avgQueryTime: (ms) => console.log(`Query latency: ${ms}ms`),
  errorRate: (pct) => console.log(`Error rate: ${pct}%`),
};

// All should be ≤ baseline by day 3
```

---

## TROUBLESHOOTING GUIDE

### Problem: "42501 - Permission denied" on SELECT

**Cause**: RLS blocking legitimate access  
**Solution**:
```sql
-- Check which policy matched
EXPLAIN (ANALYZE, VERBOSE) 
SELECT * FROM articles WHERE created_by = auth.uid()::text;

-- If showing "Seq Scan Filter: (false)" → policy denying access
-- Review policy condition, may need to add user to admin role
```

### Problem: CSP blocks Turnstile but we allow it

**Cause**: Nonce or iframe mismatch  
**Solution**:
```typescript
// Log all CSP violations for debugging
window.addEventListener('securitypolicyviolation', (e) => {
  console.warn('CSP Violation:', {
    blockedURI: e.blockedURI,
    directive: e.violatedDirective,
    sourceFile: e.sourceFile,
    lineNumber: e.lineNumber,
  });
});
```

### Problem: TypeScript complains about unknown fields

**Cause**: Trying to pass immutable fields to update function  
**Solution**:
```typescript
// Use AllowedArticleUpdates type (prevents mistakes)
const updates: AllowedArticleUpdates = {
  title: 'New',
  // created_at: ... ❌ TypeScript error - good!
};
```

### Problem: Tests pass locally but fail in CI

**Cause**: Environment variables missing in CI  
**Solution**:
```bash
# Add to GitHub Actions (or Cloudflare Pages env)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

---

## ROLLBACK PLAN (If needed)

**Scenario**: RLS policy breaks production traffic

```bash
# 1. Identify which policy caused issue
# Check Supabase logs: Auth → User-Defined Policies

# 2. Quick fix: Disable specific policy
ALTER TABLE public.articles DISABLE POLICY "Users can update own articles";

# 3. Rollback code to previous version
git revert HEAD
git push origin main

# 4. After fix: Re-enable policy
ALTER TABLE public.articles ENABLE POLICY "Users can update own articles";
```

---

## DOCUMENTATION FOR TEAM

Share this with your team:

1. **For Frontend Devs**:
   - Never send `created_at`, `created_by`, `published_at` to backend
   - Use `updateArticleSafe()` function (prevents mistakes)
   - CSP might block some libraries (check DevTools console)

2. **For Database Admins**:
   - RLS policies replace row-level access control logic
   - Audit trail automatically logged to `audit_logs` table
   - Backup database before migration

3. **For QA**:
   - Test matrix: user role × article ownership × action (read/write/delete)
   - Monitor CSP violations for false positives
   - Check performance on large datasets (RLS filtering)

---

## REFERENCE LINKS

- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [CSP MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)

---

**Questions?** Check SECURITY-ARCHITECTURE.md for deeper explanations  
**Time to complete**: 2-3 days with full testing  
**Risk level**: Low (backward compatible, can rollback)  
**Post-launch monitoring**: 7 days (24/7 alert on auth/CSP errors)
