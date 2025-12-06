import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client.ts";
import { loginSchema } from "../../../api/validation/auth.ts";
import { logApiError } from "../../../api/services/logging/logApiError.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          message: "Nieprawidłowe dane logowania",
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

    // Attempt to sign in with password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Log error for debugging
      logApiError({
        endpoint: "/api/auth/login",
        status: 401,
        detail: `Authentication failed: ${error.message}`,
      });

      // Return generic error message for security
      return new Response(
        JSON.stringify({
          message: "Nieprawidłowy adres e-mail lub hasło",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        user: {
          id: data.user.id,
          email: data.user.email,
        },
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
      endpoint: "/api/auth/login",
      status: 500,
      detail: error instanceof Error ? error.message : "Unknown error",
    });

    return new Response(
      JSON.stringify({
        message: "Wystąpił błąd podczas logowania. Spróbuj ponownie.",
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
