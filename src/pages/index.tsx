import Home from "./home";
import { supabase } from "@/lib/supabaseInstance";
import type { SupabaseClient } from "@supabase/supabase-js";

declare global {
  interface Window {
    supabase: SupabaseClient;
  }
}

if (typeof window !== "undefined") {
  window.supabase = supabase;
}

export default function Index() {
  return <Home />;
}
