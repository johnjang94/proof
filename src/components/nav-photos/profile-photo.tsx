import { useEffect, useMemo, useState } from "react";

type AuthUser = {
  id: string;
  email?: string;
} | null;

type ProfileRow = {
  id: string;
  avatar_path: string | null;
  avatar_url: string | null;
};

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
    if (!user) {
      setAvatarUrl("");
      return;
    }

    let alive = true;

    const run = async () => {
      const { supabase } = await import("@/lib/supabaseInstance");

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, avatar_path, avatar_url")
        .eq("id", user.id)
        .maybeSingle<ProfileRow>();

      if (!alive) return;

      const raw =
        (profile?.avatar_url ?? "").trim() ||
        (profile?.avatar_path ?? "").trim();

      setAvatarUrl(raw ? normalizeAvatarUrl(raw) : "");
    };

    void run();

    return () => {
      alive = false;
    };
  }, [user]);

  return { user, avatarUrl, initial };
}
