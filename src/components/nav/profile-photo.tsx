import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type ProfileRow = {
  id: string;
  avatar_path: string | null;
  avatar_url: string | null;
};

const BUCKET = "avatars";

function toPublicAvatarUrl(raw: string) {
  const v = raw.trim();
  if (!v) return "";

  if (v.startsWith("http://") || v.startsWith("https://")) return v;

  let path = v;
  if (path.startsWith("/")) path = path.slice(1);
  if (path.startsWith(`${BUCKET}/`)) path = path.slice(BUCKET.length + 1);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data?.publicUrl ?? "";
}

export function useProfileBadge() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [initial, setInitial] = useState("U");

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        setUser(null);
        setAvatarUrl("");
        setInitial("U");
        return;
      }
      const u = data.user;
      setUser({ id: u.id, email: u.email ?? undefined });
      setInitial((u.email?.[0] ?? "U").toUpperCase());
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    const run = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, avatar_path, avatar_url")
        .eq("id", user.id)
        .single<ProfileRow>();

      const raw =
        (profile?.avatar_path ?? "").trim() ||
        (profile?.avatar_url ?? "").trim();

      const finalUrl = raw ? toPublicAvatarUrl(raw) : "";

      setAvatarUrl(finalUrl);
    };

    run();
  }, [user]);

  return { user, avatarUrl, initial };
}
