import { createClient } from "@supabase/supabase-js";

let supabaseAdmin: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  // Skip during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    throw new Error("Supabase not available during build");
  }

  if (!supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (!supabaseUrl || supabaseUrl.startsWith("your_") || supabaseUrl === "") {
      console.warn("[Supabase] NEXT_PUBLIC_SUPABASE_URL is not configured");
    }
    if (!supabaseServiceKey || supabaseServiceKey.startsWith("your_") || supabaseServiceKey === "") {
      console.warn("[Supabase] SUPABASE_SERVICE_ROLE_KEY is not configured");
    }

    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabaseAdmin;
}

// Export a getter function instead of calling it at module load
export { getSupabaseAdmin as supabaseAdmin };
