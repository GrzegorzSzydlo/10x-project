import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client.ts";
import { registerApiSchema } from "../../../api/validation/auth.ts";
import { logApiError } from "../../../api/services/logging/logApiError.ts";
import { devLog } from "../../../api/utils.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = registerApiSchema.safeParse(body);

    if (!validationResult.success) {
      // Log validation errors in development
      devLog("error", "Registration validation failed:", validationResult.error.errors);

      return new Response(
        JSON.stringify({
          message: "Nieprawidłowe dane rejestracji",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { email, password } = validationResult.data;

    // Create Supabase server instance with cookie support
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Attempt to sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/api/auth/callback`,
      },
    });

    if (error) {
      // Log error for debugging
      logApiError({
        endpoint: "/api/auth/register",
        status: 400,
        detail: `Registration failed: ${error.message}`,
      });

      // Return generic error message for security
      return new Response(
        JSON.stringify({
          message: "Rejestracja nie powiodła się. Spróbuj ponownie.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Check if email confirmation is required
    const requiresEmailConfirmation = !data.session;

    // Return success response
    return new Response(
      JSON.stringify({
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
        requiresEmailConfirmation,
        message: requiresEmailConfirmation
          ? "Sprawdź swoją skrzynkę e-mail, aby potwierdzić konto"
          : "Konto zostało utworzone pomyślnie",
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    // Log unexpected errors
    logApiError({
      endpoint: "/api/auth/register",
      status: 500,
      detail: error instanceof Error ? error.message : "Unknown error",
    });

    return new Response(
      JSON.stringify({
        message: "Wystąpił błąd podczas rejestracji. Spróbuj ponownie.",
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
