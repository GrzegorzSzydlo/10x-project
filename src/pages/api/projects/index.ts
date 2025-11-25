import type { APIRoute } from "astro";
import { createProjectSchema } from "../../../api/validation/projects";
import { createProject } from "../../../api/services/projects/createProject";
import { logApiError } from "../../../api/services/logging/logApiError";
import type { UserRole } from "../../../types";

export const prerender = false;

/**
 * POST /api/projects
 * Creates a new project with the authenticated user as owner and member.
 * Requires project_manager or administrator role.
 */
export const POST: APIRoute = async ({ locals, request }) => {
  const endpoint = "POST /api/projects";
  let correlationId: string | undefined;

  try {
    // Step 1: Check authentication
    if (!locals.session) {
      logApiError({
        endpoint,
        status: 401,
        detail: "No session found in locals",
      });
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const authUser = locals.session.user;
    correlationId = `req_${Date.now()}_${authUser.id.substring(0, 8)}`;

    // Step 2: Check Content-Type
    const contentType = request.headers.get("Content-Type");
    if (!contentType?.includes("application/json")) {
      logApiError({
        endpoint,
        status: 400,
        detail: "Invalid Content-Type, expected application/json",
        correlationId,
        userId: authUser.id,
      });
      return new Response(JSON.stringify({ error: "Content-Type must be application/json" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 3: Parse and validate request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch {
      logApiError({
        endpoint,
        status: 400,
        detail: "Invalid JSON in request body",
        correlationId,
        userId: authUser.id,
      });
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const validationResult = createProjectSchema.safeParse(requestBody);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      logApiError({
        endpoint,
        status: 400,
        detail: `Validation failed: ${JSON.stringify(errors)}`,
        correlationId,
        userId: authUser.id,
      });

      return new Response(JSON.stringify({ error: "Validation failed", details: errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 4: Check user role authorization
    const { data: userData, error: userError } = await locals.supabase
      .from("users")
      .select("role")
      .eq("id", authUser.id)
      .single();

    if (userError || !userData) {
      logApiError({
        endpoint,
        status: 403,
        detail: `User not found or error fetching user: ${userError?.message}`,
        correlationId,
        userId: authUser.id,
      });
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userRole = userData.role as UserRole;
    if (!["project_manager", "administrator"].includes(userRole)) {
      logApiError({
        endpoint,
        status: 403,
        detail: `Insufficient role: ${userRole}`,
        correlationId,
        userId: authUser.id,
      });
      return new Response(JSON.stringify({ error: "Insufficient role" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 5: Create project using service
    const project = await createProject(validationResult.data, {
      ownerId: authUser.id,
      supabase: locals.supabase,
    });

    // Step 6: Return success response
    return new Response(JSON.stringify(project), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        Location: `/projects/${project.id}`,
      },
    });
  } catch (error) {
    // Handle unexpected errors
    const detail = error instanceof Error ? error.message : "Unknown error";

    logApiError({
      endpoint,
      status: 500,
      detail: `Unexpected error: ${detail}`,
      correlationId,
    });

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        correlationId,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
