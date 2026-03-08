import { supabase } from "../supabaseInstance";

export type Role = "participant" | "client" | "hr" | "admin";

const VALID_ROLES = new Set<Role>(["participant", "client", "hr", "admin"]);

export async function getMyRole(): Promise<Role | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    if (userError) {
      console.error("getMyRole user error:", userError);
    }
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("getMyRole profile error:", error);
    return null;
  }

  const role = data?.role;

  if (!role || !VALID_ROLES.has(role as Role)) {
    return null;
  }

  return role as Role;
}
