import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseInstance";

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

export function useProfileBadge() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [initial, setInitial] = useState("U");

  useEffect(() => {
    let alive = true;

    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!alive) return;

      if (error || !data.user) {
        setUser(null);
        setAvatarUrl("");
        setInitial("U");
        return;
      }

      const u = data.user;
      setUser({ id: u.id, email: u.email ?? undefined });
      setInitial((u.email?.[0] ?? "U").toUpperCase());
    };

    loadUser();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    let alive = true;

    const run = async () => {
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

    run();

    return () => {
      alive = false;
    };
  }, [user]);

  return { user, avatarUrl, initial };
}
