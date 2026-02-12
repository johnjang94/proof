import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CgProfile } from "react-icons/cg";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type ProfileRow = {
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  points: number | null;
  avatar_url: string | null;
};

type DisplayProfile = {
  name: string;
  avatarUrl: string | null;
  points: number;
};

export default function ProfileSlot() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DisplayProfile | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async (reason: string) => {
      console.groupCollapsed(`[ProfileSlot] load (${reason})`);

      try {
        const { data: userData } = await supabase.auth.getUser();

        if (!mounted) {
          console.groupEnd();
          return;
        }

        const u = userData?.user ?? null;
        setUser(u);

        if (!u) {
          setProfile(null);
          console.groupEnd();
          return;
        }

        const { data: p, error: profileErr } = await supabase
          .from("profiles")
          .select("username, first_name, last_name, role, points, avatar_url")
          .eq("id", u.id)
          .single<ProfileRow>();

        if (!mounted) {
          console.groupEnd();
          return;
        }

        if (profileErr || !p) {
          const fallbackName = u.email ? u.email.split("@")[0] : "User";

          setProfile({ name: fallbackName, avatarUrl: null, points: 0 });
          console.groupEnd();
          return;
        }

        const first = (p.first_name ?? "").trim();
        const last = (p.last_name ?? "").trim();
        const fullName = [first, last].filter(Boolean).join(" ").trim();
        const name = fullName || "User";

        setProfile({
          name,
          avatarUrl: (p.avatar_url as string | null) ?? null,
          points: (p.points as number | null) ?? 0,
        });

        console.groupEnd();
      } catch (e) {
        console.error("[ProfileSlot] unexpected error:", e);
        console.groupEnd();
      }
    };

    load("mount");

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      load(`auth:${event}`);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const href = user ? "/category/profile" : "/category/login";
  const label = useMemo(() => (user ? "Profile" : "Login"), [user]);

  if (!user || !profile) {
    return (
      <Link
        href={href}
        className="hidden sm:block cursor-pointer p-2"
        aria-label={label}
      >
        <CgProfile className="text-3xl" />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="hidden sm:flex items-center gap-2 rounded-xl p-2 hover:bg-slate-100"
      aria-label={label}
    >
      <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200">
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt="avatar"
            width={40}
            height={40}
            className="h-10 w-10 object-cover"
          />
        ) : null}
      </div>

      <div className="flex flex-col leading-tight">
        <span className="text-sm font-medium">{profile.name}</span>
        <span className="text-[10px] text-red-500">DEBUG: {profile.name}</span>
        <span className="text-xs text-slate-500">
          {profile.points.toLocaleString()} pts
        </span>
      </div>
    </Link>
  );
}
