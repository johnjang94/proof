import { apiFetch } from "@/lib/apiFetch";

export type Role = "participant" | "client" | "hr" | "admin";
const VALID_ROLES = new Set<Role>(["participant", "client", "hr", "admin"]);

export async function getMyRole(): Promise<Role | null> {
  try {
    const res = await apiFetch("/auth/me");
    if (!res.ok) return null;
    const user = await res.json();
    const role = user?.role;
    if (!role || !VALID_ROLES.has(role as Role)) return null;
    return role as Role;
  } catch (e) {
    console.error("getMyRole error:", e);
    return null;
  }
}
