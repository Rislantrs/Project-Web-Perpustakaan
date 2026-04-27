# ⚡ Security Hardening - FAST TRACK (TODAY ONLY)

**Durasi**: ~3 jam  
**Tim**: Kamu + team (untuk testing parallel)  
**Fokus**: Database → Frontend → Test → Deploy

---

## TIMELINE

### 09:00-09:20 (20 min) - DATABASE MIGRATION
```bash
# Terminal 1: Copy SQL migration ke Supabase dashboard
# Buka: https://supabase.com/dashboard
# → SQL Editor → New Query
# Copy-paste seluruh isi: supabase/migrations/20260427_security-hardening.sql

# Atau via CLI (lebih cepat):
cd "c:\Users\Rislan\Downloads\Library Website Design"
supabase db push  # Jika sudah setup supabase CLI

# Verify (jalankan di SQL Editor):
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('articles', 'categories', 'members');

# ✅ Expected: semuanya TRUE (RLS enabled)
```

---

### 09:20-10:15 (55 min) - FRONTEND SETUP

#### Step 1: Copy security module (5 min)
```bash
# Terminal 2: Code kamu sudah ready
# File /src/security/examples.ts sudah ada
# Tinggal copy fungsi-fungsi ke service yang sesuai

# Check apa yang sudah ada:
ls src/services/
# → Output: dataService.ts, authService.ts, dll
```

#### Step 2: Update dataService.ts (15 min)
```typescript
// File: src/services/dataService.ts
// Tambahkan di bawah imports:

import { 
  updateArticleSafe, 
  AllowedArticleUpdates,
  handleSecurityError 
} from '../security/examples';

// Di mana ada updateCategory atau updateArticle, ganti dengan:
export const updateArticle = async (
  id: string, 
  updates: AllowedArticleUpdates
) => {
  try {
    return await updateArticleSafe(supabase, id, updates);
  } catch (error) {
    return { error: { message: handleSecurityError(error) } };
  }
};
```

#### Step 3: Update authService.ts (10 min)
```typescript
// File: src/services/authService.ts
// Cari loginAdmin() function, sudah di-update sebelumnya
// Just verify: ada `supabase.auth.signInWithPassword()` call

// Harus ada:
const { error: authError } = await supabase.auth.signInWithPassword({
  email: normalizedEmail,
  password,
});

if (authError) {
  return { success: false, message: 'Login Cloud gagal' };
}
```

#### Step 4: Setup monitoring (15 min)
```typescript
// File: src/main.tsx
// Tambahkan sebelum ReactDOM.render():

import { setupSecurityMonitoring } from './security/monitoring';
import { supabase } from './services/supabase';

// Setup monitoring
setupSecurityMonitoring(supabase);

// Monitor CSP violations
window.addEventListener('securitypolicyviolation', (e) => {
  console.warn('[CSP] Violation:', e.blockedURI, e.violatedDirective);
});
```

#### Step 5: Add CSP headers (10 min)
```
# File: public/_headers (create if not exist)

[[headers]]
path = "/*"

[headers.values]
Content-Security-Policy = "default-src 'self'; script-src 'self' 'wasm-unsafe-eval' https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com; connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data: https://fonts.gstatic.com; form-action 'self' https://*.supabase.co; frame-ancestors 'none';"
```

---

### 10:15-11:00 (45 min) - TESTING (Parallel dengan team)

**Kamu**: Unit tests + RLS verification
**Team member 1**: CSP compliance test
**Team member 2**: Manual UI testing

#### Your task: Quick test suite
```bash
# Terminal 3: Setup & run tests
cd src

# Create test file (copy dari examples.ts SECURITY_TESTS)
# File: tests/security.quick.test.ts

# Run:
npm install -D vitest  # Jika belum ada
npm run test -- security.quick.test.ts

# Expected output:
# ✓ Immutable columns test (PASS)
# ✓ RLS test (PASS)
# ✓ CSP test (PASS)
```

#### Team member 1: CSP check
```bash
# Terminal 4: Verify CSP headers
curl -I https://your-staging-url.pages.dev

# Look for: Content-Security-Policy header ada
# Try load script dari evil.com di console → harus block
```

#### Team member 2: Manual test checklist
```
✓ Login admin → try add kategori baru
✓ Try edit article created_at di DevTools → harus error
✓ Try access other user's article → harus RLS block (401)
✓ Create article → check published_at auto-set
✓ Monitor console → no CSP violations
```

---

### 11:00-11:30 (30 min) - VERIFICATION & STAGING

#### Verify database changes live
```sql
-- Run di Supabase SQL Editor

-- 1. Check immutable columns
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'articles' AND constraint_type = 'CHECK';
-- ✓ Should show: check_immutable_created_at, check_immutable_created_by

-- 2. Check RLS enabled
SELECT tablename FROM pg_tables 
WHERE tablename IN ('articles', 'categories', 'members') AND rowsecurity = true;
-- ✓ Should show all 3 tables

-- 3. Check triggers
SELECT trigger_name FROM information_schema.triggers 
WHERE table_name = 'articles';
-- ✓ Should show: trigger_update_articles_updated_at, trigger_set_published_timestamp

-- 4. Check audit table
SELECT COUNT(*) FROM audit_logs;
-- ✓ Should be >= 0 (table exists)
```

#### Push to Cloudflare
```bash
# Terminal 2:
git add .
git commit -m "🔒 Security: Immutable columns + RLS + CSP"
git push origin main

# Cloudflare auto-deploy (takes ~2 min)
# Check: https://pages.dev/security → should see CSP header
```

---

### 11:30-12:00 (30 min) - SMOKE TEST (Production check)

**Do this LAST before calling it done:**

```bash
# Terminal: Quick smoke test
npm run build  # Make sure build succeed

# Check bundle size tidak naik drastis
# Expected: <500KB gzipped

# Test production endpoints:
curl -X GET https://your-domain/articles \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Should return articles (RLS filtering applied)
```

---

## CRITICAL CHECKPOINTS (Jangan skip!)

- [ ] Database migration berhasil (no SQL errors)
- [ ] All RLS policies enabled (verify query di atas)
- [ ] Frontend imports dari security/examples.ts berhasil
- [ ] CSP header ada di responses
- [ ] Immutable column test PASS
- [ ] Build succeed, no TypeScript errors
- [ ] Git push complete, deploy success

---

## ROLLBACK (Jika ada masalah)

```bash
# Jika critical error di production:

# 1. Quick code rollback
git revert HEAD
git push origin main

# 2. Database rollback (via Supabase backup)
# Dashboard → Database → Backups → Restore

# Contact kamu: Rislan
# Masalah apa? RLS? CSP? Frontend? → urus cepat
```

---

## FINAL CHECKLIST

### Database ✅
- [ ] Migration run successful
- [ ] RLS enabled on 3 tables
- [ ] Triggers created
- [ ] Audit logs table ready

### Frontend ✅
- [ ] dataService imports security functions
- [ ] authService has Supabase JWT call
- [ ] main.tsx setup monitoring
- [ ] _headers file updated (CSP)
- [ ] No TypeScript errors

### Testing ✅
- [ ] Unit tests PASS
- [ ] RLS verification PASS
- [ ] CSP compliance PASS
- [ ] Manual testing checklist done

### Deploy ✅
- [ ] Git committed & pushed
- [ ] Cloudflare deploy successful
- [ ] Smoke test PASS
- [ ] 7-day monitoring dashboard ready

---

## WHO DOES WHAT (REAL-TIME)

| Time | You | Team 1 | Team 2 |
|------|-----|--------|--------|
| 09:00-09:20 | DB migration | - | - |
| 09:20-10:15 | Frontend setup | - | - |
| 10:15-11:00 | Unit tests | CSP check | Manual test |
| 11:00-11:30 | DB verify | - | - |
| 11:30-12:00 | Build + deploy | Monitor | Alert ready |

---

## IF SOMETHING BREAKS

**RLS blocking everything?**
```sql
-- Disable single policy (emergency)
ALTER TABLE articles DISABLE POLICY "Users can update own articles";
-- Then fix + enable after
ALTER TABLE articles ENABLE POLICY "Users can update own articles";
```

**CSP blocking critical script?**
```
# Update _headers, add domain to connect-src
connect-src 'self' https://*.domain.com
```

**Frontend fails to build?**
```bash
# Check imports
npm ls
# Missing package? Install
npm install [package-name]
```

---

## POST-LAUNCH (Hari 1 evening)

Kalo semua sudah jalan, 2 hal:

1. **Monitor alert system** (24/7)
   - Watch: CSP violations
   - Watch: Auth failures (401)
   - Watch: RLS blocks (42501)

2. **Team update**
   - Kasih tahu: Jangan send created_at di updates
   - Use: updateArticleSafe() function
   - Check: Error messages jika ada auth issues

---

**Estimasi total**: 3 jam focused execution  
**Risk**: Low (dapat rollback instant)  
**Gain**: Production-grade security (immutable data + RLS + CSP)

Siap? Mari mulai! 🚀
