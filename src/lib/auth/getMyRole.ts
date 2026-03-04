import { supabase } from "../supabaseInstance";

export type Role = "participant" | "client" | "hr" | "admin";

export async function getMyRole(): Promise<Role | null> {
  const { data: sessionData, error: sessionErr } =
    await supabase.auth.getSession();
  if (sessionErr || !sessionData.session) return null;

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) return null;
  return (data?.role as Role) ?? null;
}
