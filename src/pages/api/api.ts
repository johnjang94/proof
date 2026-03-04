import { supabase } from "@/lib/supabaseInstance";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const url = typeof input === "string" ? `${API_BASE}${input}` : input;

  return fetch(url, { ...init, headers });
}
