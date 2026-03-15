import { supabase } from "@/lib/supabaseInstance";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  if (!API_BASE && typeof input === "string" && input.startsWith("/")) {
    throw new Error("NEXT_PUBLIC_API_BASE is not set");
  }

  const token = await Promise.race([
    supabase.auth
      .getSession()
      .then(({ data }) => data?.session?.access_token ?? null),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 5_000)),
  ]);

  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const url =
    typeof input === "string"
      ? input.startsWith("http")
        ? input
        : `${API_BASE ?? ""}${input}`
      : input;

  return fetch(url, { ...init, headers });
}
