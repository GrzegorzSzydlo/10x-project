import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client.ts";
import { updatePasswordApiSchema } from "../../../api/validation/auth.ts";
import { logApiError } from "../../../api/services/logging/logApiError.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = updatePasswordApiSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          message: "Nieprawidłowe dane",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { password } = validationResult.data;

    // Create Supabase server instance with cookie support
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Update user password
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      // Log error for debugging
      logApiError({
        endpoint: "/api/auth/update-password",
        status: 400,
        detail: `Password update failed: ${error.message}`,
      });

      return new Response(
        JSON.stringify({
          message: "Zmiana hasła nie powiodła się. Spróbuj ponownie.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        message: "Hasło zostało zmienione pomyślnie",
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
      endpoint: "/api/auth/update-password",
      status: 500,
      detail: error instanceof Error ? error.message : "Unknown error",
    });

    return new Response(
      JSON.stringify({
        message: "Wystąpił błąd podczas zmiany hasła. Spróbuj ponownie.",
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
