import { defineMiddleware } from "astro:middleware";

import { supabaseClient } from "../db/supabase.client.ts";

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.supabase = supabaseClient;
  
  // Extract session from Authorization header
  const authHeader = context.request.headers.get("Authorization");
  let session = null;
  
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const { data } = await supabaseClient.auth.getUser(token);
      if (data.user) {
        session = { user: data.user, access_token: token } as any;
      }
    } catch {
      // Invalid token, session remains null
    }
  }
  
  context.locals.session = session;
  return next();
});
