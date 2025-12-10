import { defineMiddleware } from "astro:middleware";
import type { User } from "@supabase/supabase-js";
import { supabaseClient, createSupabaseServerInstance } from "../db/supabase.client.ts";

interface LocalsSession {
  user: User;
  access_token: string;
}

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
        locals.session = { user: data.user, access_token: token } as LocalsSession;
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

    locals.supabase = supabase;

    // IMPORTANT: Use getUser() instead of getSession() for security
    // getUser() validates the JWT by contacting Supabase Auth server
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (user && !error) {
      // Create session object for backward compatibility
      locals.session = { user, access_token: "" } as LocalsSession;
      locals.user = {
        email: user.email,
        id: user.id,
      };
    } else {
      locals.session = null;
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
