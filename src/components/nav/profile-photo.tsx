import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

const PROFILE_ID_COL: "id" | "user_id" = "id";

type ProfileRow = { avatar_url: string | null };

export function useProfileBadge() {
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");

  const initial = useMemo(() => {
    const s = displayName.trim();
    return s ? s.charAt(0).toUpperCase() : "U";
  }, [displayName]);

  useEffect(() => {
    let mounted = true;

    const getDisplayName = (u: User) => {
      const meta = u.user_metadata ?? {};
      return (
        (meta.full_name as string | undefined) ??
        (meta.name as string | undefined) ??
        (u.email ? u.email.split("@")[0] : "U") ??
        "U"
      );
    };

    const resolveAvatarUrl = async (u: User) => {
      const { data: p, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq(PROFILE_ID_COL, u.id)
        .maybeSingle<ProfileRow>();

      if (!mounted) return;

      if (error) {
        console.log("[profiles] avatar_url fetch error:", error);
        setAvatarUrl(null);
        return;
      }

      const stored = p?.avatar_url ?? null;
      if (!stored) {
        setAvatarUrl(null);
        return;
      }

      if (stored.startsWith("http")) {
        setAvatarUrl(stored);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(stored);
      setAvatarUrl(data.publicUrl ?? null);
    };

    const sync = async (u: User | null) => {
      if (!mounted) return;

      setUser(u);

      if (!u) {
        setAvatarUrl(null);
        setDisplayName("");
        return;
      }

      setDisplayName(getDisplayName(u));
      await resolveAvatarUrl(u);
    };

    supabase.auth.getUser().then(({ data }) => sync(data.user ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      sync(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, avatarUrl, displayName, initial };
}
