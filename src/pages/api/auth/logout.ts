import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client.ts";
import { logApiError } from "../../../api/services/logging/logApiError.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Create Supabase server instance with cookie support
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Sign out the user
    const { error } = await supabase.auth.signOut();

    if (error) {
      // Log error for debugging
      logApiError({
        endpoint: "/api/auth/logout",
        status: 500,
        detail: `Logout failed: ${error.message}`,
      });

      return new Response(
        JSON.stringify({
          message: "Wylogowanie nie powiodło się. Spróbuj ponownie.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Return success response
    return new Response(null, {
      status: 200,
    });
  } catch (error) {
    // Log unexpected errors
    logApiError({
      endpoint: "/api/auth/logout",
      status: 500,
      detail: error instanceof Error ? error.message : "Unknown error",
    });

    return new Response(
      JSON.stringify({
        message: "Wystąpił błąd podczas wylogowania. Spróbuj ponownie.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
