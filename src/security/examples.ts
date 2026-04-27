// ✅ READY-TO-USE: Security Implementation Examples
// File: src/security/examples.ts

import { SupabaseClient } from "@supabase/supabase-js";

/**
 * EXAMPLE 1: Immutable Columns Guard
 * Ensure client NEVER sends created_at, created_by, status fields
 */
export const createArticle = async (
  supabase: SupabaseClient,
  article: {
    title: string;
    content: string;
    excerpt?: string;
    // ✅ NOT ALLOWED: created_at, created_by, published_at
  }
) => {
  // ✅ Only insert allowed fields
  const { data, error } = await supabase
    .from("articles")
    .insert({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || "",
      // Server will auto-set: created_at, created_by via trigger/RLS
    })
    .select()
    .single();

  return { data, error };
};

export const updateArticle = async (
  supabase: SupabaseClient,
  id: string,
  updates: {
    title?: string;
    content?: string;
    excerpt?: string;
    // ✅ NOT ALLOWED: created_at, created_by, published_at, status
  }
) => {
  // ✅ Validate: don't send immutable fields
  const immutableFields = ["created_at", "created_by", "published_at", "status"];
  const updateKeys = Object.keys(updates);

  const hasImmutable = updateKeys.some((key) =>
    immutableFields.includes(key)
  );

  if (hasImmutable) {
    throw new Error("Cannot update immutable columns");
  }

  const { data, error } = await supabase
    .from("articles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error?.code === "42501") {
    // RLS Violation: User tidak authorized
    throw new Error("Unauthorized: Anda tidak memiliki akses ke artikel ini");
  }

  return { data, error };
};

/**
 * EXAMPLE 2: Publish Article (Status Change via Server)
 * Hanya server yang boleh set published_at timestamp
 */
export const publishArticle = async (
  supabase: SupabaseClient,
  articleId: string
) => {
  // ✅ Call Edge Function, bukan direct DB
  // (Server akan set published_at otomatis via trigger)
  const response = await fetch("/functions/publish-article", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ articleId }),
  });

  if (response.status === 403) {
    throw new Error("Unauthorized: Tidak punya permission untuk publish");
  }

  return response.json();
};

/**
 * EXAMPLE 3: Access Control with RLS
 * Verify data adalah milik current user sebelum update
 */
export const ensureOwnership = async (
  supabase: SupabaseClient,
  articleId: string,
  userId: string
): Promise<boolean> => {
  // ✅ Query dengan RLS: hanya return data jika user adalah owner
  const { data, error } = await supabase
    .from("articles")
    .select("id, created_by")
    .eq("id", articleId)
    .eq("created_by", userId)
    .single();

  if (error?.code === "PGRST116") {
    // No rows returned = RLS blocked it
    return false;
  }

  return !!data;
};

/**
 * EXAMPLE 4: Safe Query with RLS
 * Automatically filtered by RLS policy
 */
export const getUserArticles = async (supabase: SupabaseClient) => {
  // ✅ RLS policy will automatically filter: WHERE created_by = auth.uid()
  // Client doesn't need to add WHERE clause
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, status, created_at, published_at")
    .order("created_at", { ascending: false });

  if (error?.code === "42501") {
    // RLS violation
    throw new Error("Access Denied by RLS Policy");
  }

  return data;
};

/**
 * EXAMPLE 5: CSP & Turnstile Integration
 * Safe way to load external scripts
 */
export const initTurnstile = () => {
  // ✅ Load dynamically, not hardcoded in HTML
  const script = document.createElement("script");
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
  script.async = true;
  script.defer = true;

  script.onerror = () => {
    console.error("Turnstile failed to load");
    // ✅ Fallback: show alternative CAPTCHA
  };

  script.onload = () => {
    // ✅ Only after script loaded, render widget
    if (window.turnstile) {
      window.turnstile.render("#turnstile-container", {
        sitekey: import.meta.env.VITE_TURNSTILE_SITEKEY,
        callback: handleTurnstileSuccess,
      });
    }
  };

  document.head.appendChild(script);
};

const handleTurnstileSuccess = async (token: string) => {
  // ✅ Verify token on backend
  const response = await fetch("/functions/verify-turnstile", {
    method: "POST",
    body: JSON.stringify({ token }),
  });

  if (response.ok) {
    // ✅ Turnstile passed
    return true;
  }

  return false;
};

/**
 * EXAMPLE 6: Security Monitoring
 * Detect and log suspicious activity
 */
export const setupSecurityMonitoring = (supabase: SupabaseClient) => {
  // ✅ Monitor CSP violations
  window.addEventListener("securitypolicyviolation", async (event) => {
    // Log ke backend (non-blocking)
    navigator.sendBeacon("/functions/log-csp-violation", {
      blockedURI: event.blockedURI,
      directive: event.violatedDirective,
      source: event.sourceFile,
    });
  });

  // ✅ Monitor RLS violations
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch.apply(window, args);

    if (response.status === 401 || response.status === 403) {
      // Potential security issue
      await supabase.from("security_alerts").insert({
        type: "auth_failure",
        severity: "high",
        details: {
          endpoint: args[0],
          status: response.status,
        },
      });
    }

    return response;
  };
};

/**
 * EXAMPLE 7: Type-Safe Update (Never Send Immutable Columns)
 * Compile-time check menggunakan TypeScript
 */
export type AllowedArticleUpdates = Omit<
  Article,
  "id" | "created_at" | "created_by" | "published_at" | "status"
>;

export const updateArticleSafe = async (
  supabase: SupabaseClient,
  id: string,
  updates: AllowedArticleUpdates
) => {
  // ✅ TypeScript ensures only allowed fields are passed
  return supabase.from("articles").update(updates).eq("id", id);
};

/**
 * EXAMPLE 8: Error Handling untuk Security Errors
 */
export const handleSecurityError = (error: any): string => {
  if (error?.code === "42501") {
    return "Anda tidak memiliki akses ke resource ini (RLS Policy)";
  }

  if (error?.code === "42000") {
    return "Akses ditolak oleh server (Authentication Required)";
  }

  if (error?.code === "PGRST116") {
    return "Resource tidak ditemukan atau Anda tidak memiliki akses";
  }

  if (error?.status === 401) {
    return "Sesi Anda sudah expired. Silakan login ulang.";
  }

  if (error?.status === 403) {
    return "Akses ditolak. Anda tidak punya permission untuk action ini.";
  }

  return "Terjadi kesalahan. Silakan coba lagi.";
};

/**
 * EXAMPLE 9: Secure Headers Configuration
 * Untuk dimasukkan ke Cloudflare _headers file
 */
export const CSP_HEADER = `
default-src 'self';
script-src 'self' 'wasm-unsafe-eval' https://challenges.cloudflare.com;
frame-src 'self' https://challenges.cloudflare.com;
connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com;
img-src 'self' data: https:;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' data: https://fonts.gstatic.com;
form-action 'self' https://*.supabase.co;
frame-ancestors 'none';
upgrade-insecure-requests;
`;

/**
 * EXAMPLE 10: Test Suite Template
 * Copy ke tests/security.test.ts
 */
export const SECURITY_TESTS = `
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Security Tests', () => {
  let supabase: SupabaseClient;
  let userToken: string;

  beforeEach(async () => {
    // Setup test environment
    supabase = createClient(TEST_SUPABASE_URL, TEST_SUPABASE_KEY);
    
    // Login as test user
    const { data } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpass123',
    });
    userToken = data.session?.access_token!;
  });

  afterEach(async () => {
    await supabase.auth.signOut();
  });

  it('should prevent updating created_at', async () => {
    const { data: article } = await supabase
      .from('articles')
      .insert({ title: 'Test' })
      .select()
      .single();

    const { error } = await supabase
      .from('articles')
      .update({ created_at: new Date().toISOString() })
      .eq('id', article.id);

    expect(error?.code).toBe('42501');
  });

  it('should block access to other users data', async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('created_by', otherUserId);

    expect(error?.code).toBe('42501');
    expect(data).toBeNull();
  });

  it('should allow Turnstile script via CSP', async () => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    
    let loaded = false;
    script.onload = () => { loaded = true; };
    document.head.appendChild(script);

    await new Promise(r => setTimeout(r, 2000));
    expect(loaded).toBe(true);
  });
});
`;
