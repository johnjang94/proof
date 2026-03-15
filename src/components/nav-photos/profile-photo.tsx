import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";

type AuthUser = {
  id: string;
  email?: string;
} | null;

function normalizeAvatarUrl(raw: string) {
  const v = raw.trim();
  if (!v) return "";
  if (v.startsWith("http://") || v.startsWith("https://")) return v;

  const base = (process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? "").trim();
  if (!base) return "";

  let path = v;
  if (path.startsWith("/")) path = path.slice(1);

  return `${base.replace(/\/$/, "")}/${path}`;
}

export function useProfileBadge(user: AuthUser) {
  const [avatarUrl, setAvatarUrl] = useState("");

  const initial = useMemo(
    () => (user?.email?.[0] ?? "U").toUpperCase(),
    [user?.email],
  );

  useEffect(() => {
    if (!user) return;

    let alive = true;

    const run = async () => {
      const res = await apiFetch("/auth/me");
      if (!alive) return;

      const profile = res.ok ? await res.json() : null;

      const raw =
        (profile?.avatarUrl ?? "").trim() || (profile?.avatarPath ?? "").trim();

      setAvatarUrl(raw ? normalizeAvatarUrl(raw) : "");
    };

    void run();

    return () => {
      alive = false;
    };
  }, [user]);

  return { user, avatarUrl, initial };
}
