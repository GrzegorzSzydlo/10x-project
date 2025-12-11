import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client.ts";

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

const AUTH_PAGE_PATHS = ["/login", "/register", "/password-recovery"];

export const onRequest = defineMiddleware(async ({ cookies, url, request, redirect, locals }, next) => {
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  locals.supabase = supabase;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  locals.session = session ?? null;
  locals.user = user
    ? {
        email: user.email,
        id: user.id,
      }
    : null;

  const isPublicPath = PUBLIC_PATHS.some((path) => url.pathname.startsWith(path));
  const isAuthPage = AUTH_PAGE_PATHS.some((path) => url.pathname.startsWith(path));
  const isUpdatePasswordPage = url.pathname.startsWith("/update-password");

  if (user && isAuthPage) {
    return redirect("/");
  }

  if (!user && !isPublicPath && !isUpdatePasswordPage) {
    return redirect("/login");
  }

  return next();
});
