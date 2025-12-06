import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client.ts";

export const prerender = false;

export const GET: APIRoute = async ({ url, cookies, request, redirect }) => {
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/";

  if (code) {
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return redirect(next);
    }
  }

  // If there's an error or no code, redirect to login
  return redirect("/login");
};
