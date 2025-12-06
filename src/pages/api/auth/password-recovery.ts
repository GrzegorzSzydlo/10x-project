import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client.ts";
import { passwordRecoverySchema } from "../../../api/validation/auth.ts";
import { logApiError } from "../../../api/services/logging/logApiError.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = passwordRecoverySchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          message: "Nieprawidłowy adres e-mail",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { email } = validationResult.data;

    // Create Supabase server instance with cookie support
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Request password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/update-password`,
    });

    if (error) {
      // Log error for debugging
      logApiError({
        endpoint: "/api/auth/password-recovery",
        status: 400,
        detail: `Password recovery failed: ${error.message}`,
      });

      // Always return success to prevent email enumeration
      return new Response(
        JSON.stringify({
          message: "Jeśli podany adres e-mail istnieje, wysłaliśmy link do resetowania hasła",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        message: "Jeśli podany adres e-mail istnieje, wysłaliśmy link do resetowania hasła",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    // Log unexpected errors
    logApiError({
      endpoint: "/api/auth/password-recovery",
      status: 500,
      detail: error instanceof Error ? error.message : "Unknown error",
    });

    return new Response(
      JSON.stringify({
        message: "Wystąpił błąd podczas resetowania hasła. Spróbuj ponownie.",
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
