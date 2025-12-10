import { createClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";

import type { Database } from "./database.types.ts";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

// Temporary debugging logs - REMOVE IN PRODUCTION
console.log("=== SUPABASE ENV VARS DEBUG ===");
console.log("SUPABASE_URL:", supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "UNDEFINED");
console.log("SUPABASE_KEY:", supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : "UNDEFINED");
console.log("All import.meta.env keys:", Object.keys(import.meta.env));
console.log("================================");

// Legacy client for Bearer token authentication (API endpoints)
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Type alias for consistency
export type SupabaseClient = typeof supabaseClient;

// Cookie options for SSR authentication
export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

// Server-side client for cookie-based authentication (Astro pages)
export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  // Temporary debugging logs - REMOVE IN PRODUCTION
  console.log("=== SUPABASE SERVER INSTANCE DEBUG ===");
  console.log("SUPABASE_URL:", import.meta.env.SUPABASE_URL ? `${import.meta.env.SUPABASE_URL.substring(0, 30)}...` : "UNDEFINED");
  console.log("SUPABASE_KEY:", import.meta.env.SUPABASE_KEY ? `${import.meta.env.SUPABASE_KEY.substring(0, 20)}...` : "UNDEFINED");
  console.log("======================================");
  
  const supabase = createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });

  return supabase;
};
