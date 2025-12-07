import { defineMiddleware } from "astro:middleware";

import { supabaseClient, createSupabaseServerInstance } from "../db/supabase.client.ts";

// Public paths - Auth pages and API endpoints
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/password-recovery",
  "/update-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/password-recovery",
  "/api/auth/update-password",
  "/api/auth/callback",
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, url, request, redirect, locals } = context;

  // Legacy support: Extract session from Authorization header for API endpoints
  const authHeader = request.headers.get("Authorization");

  if (authHeader?.startsWith("Bearer ")) {
    // Bearer token authentication for API endpoints
    const token = authHeader.substring(7);
    try {
      const { data } = await supabaseClient.auth.getUser(token);
      if (data.user) {
        locals.session = { user: data.user, access_token: token } as any;
        locals.supabase = supabaseClient;
      }
    } catch {
      // Invalid token, session remains null
      locals.session = null;
    }
  } else {
    // Cookie-based authentication for Astro pages
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // IMPORTANT: Always get user session first before any other operations
    const {
      data: { session },
    } = await supabase.auth.getSession();

    locals.session = session;
    locals.supabase = supabase;

    if (session?.user) {
      locals.user = {
        email: session.user.email,
        id: session.user.id,
      };
    } else {
      locals.user = null;
    }
  }

  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  // Redirect to login for protected routes if not authenticated
  if (!locals.session?.user) {
    return redirect("/login");
  }

  return next();
});
