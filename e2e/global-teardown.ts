import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/db/database.types";
import dotenv from "dotenv";
import path from "path";

// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

async function globalTeardown() {
  console.log("Starting database cleanup...");

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const testUserId = process.env.E2E_USERNAME_ID;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_KEY in .env.test");
    return;
  }

  if (!testUserId) {
    console.error("Missing E2E_USERNAME_ID in .env.test");
    return;
  }

  // Create Supabase admin client
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  try {
    // Delete in order to respect foreign key constraints
    // 1. Delete task history for test user's tasks
    const { error: taskHistoryError } = await supabase.from("task_history").delete().eq("user_id", testUserId);

    if (taskHistoryError) {
      console.error("Error deleting task history:", taskHistoryError);
    } else {
      console.log("✓ Deleted task history");
    }

    // 2. Get all projects owned by test user
    const { data: testProjects, error: projectsFetchError } = await supabase
      .from("projects")
      .select("id")
      .eq("owner_id", testUserId);

    if (projectsFetchError) {
      console.error("Error fetching test projects:", projectsFetchError);
    }

    const projectIds = testProjects?.map((p) => p.id) || [];

    if (projectIds.length > 0) {
      // 3. Delete tasks in test user's projects
      const { error: tasksError } = await supabase.from("tasks").delete().in("project_id", projectIds);

      if (tasksError) {
        console.error("Error deleting tasks:", tasksError);
      } else {
        console.log(`✓ Deleted tasks from ${projectIds.length} test projects`);
      }

      // 4. Delete milestones in test user's projects
      const { error: milestonesError } = await supabase.from("milestones").delete().in("project_id", projectIds);

      if (milestonesError) {
        console.error("Error deleting milestones:", milestonesError);
      } else {
        console.log(`✓ Deleted milestones from ${projectIds.length} test projects`);
      }

      // 5. Delete project members
      const { error: membersError } = await supabase.from("project_members").delete().in("project_id", projectIds);

      if (membersError) {
        console.error("Error deleting project members:", membersError);
      } else {
        console.log(`✓ Deleted project members from ${projectIds.length} test projects`);
      }

      // 6. Delete projects owned by test user
      const { error: projectsError } = await supabase.from("projects").delete().eq("owner_id", testUserId);

      if (projectsError) {
        console.error("Error deleting projects:", projectsError);
      } else {
        console.log(`✓ Deleted ${projectIds.length} test projects`);
      }
    }

    console.log("Database cleanup completed successfully!");
  } catch (error) {
    console.error("Error during database cleanup:", error);
    throw error;
  }
}

export default globalTeardown;
