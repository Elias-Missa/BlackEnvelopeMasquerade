import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || supabaseUrl.startsWith("your_") || supabaseUrl === "") {
  console.warn("[Supabase] NEXT_PUBLIC_SUPABASE_URL is not configured");
}
if (!supabaseServiceKey || supabaseServiceKey.startsWith("your_") || supabaseServiceKey === "") {
  console.warn("[Supabase] SUPABASE_SERVICE_ROLE_KEY is not configured");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
