import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CgProfile } from "react-icons/cg";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseInstance";

type ProfileRow = {
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  role: string | null;
  points: number | null;
  avatar_url: string | null;
};

type DisplayProfile = {
  name: string;
  companyName: string | null;
  role: string | null;
  avatarUrl: string | null;
  points: number;
};

export default function ProfileSlot() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DisplayProfile | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!mounted) return;

        const u = userData?.user ?? null;
        setUser(u);

        if (!u) {
          setProfile(null);
          return;
        }

        const { data: p, error } = await supabase
          .from("profiles")
          .select(
            "username, first_name, last_name, company_name, role, points, avatar_url",
          )
          .eq("id", u.id)
          .single<ProfileRow>();

        if (!mounted) return;

        if (error || !p) {
          const fallbackName = u.email ? u.email.split("@")[0] : "User";
          setProfile({
            name: fallbackName,
            companyName: null,
            role: null,
            avatarUrl: null,
            points: 0,
          });
          return;
        }

        const first = (p.first_name ?? "").trim();
        const last = (p.last_name ?? "").trim();
        const fullName = [first, last].filter(Boolean).join(" ").trim();
        const name = fullName || "User";

        setProfile({
          name,
          companyName: (p.company_name ?? "").trim() || null,
          role: p.role ?? null,
          avatarUrl: p.avatar_url ?? null,
          points: p.points ?? 0,
        });
      } catch {
        setProfile(null);
      }
    };

    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const href = user ? "/category/profile" : "/login";
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
      <div className="h-15 w-25 overflow-hidden rounded-4xl bg-slate-200">
        {profile.avatarUrl ? (
          <Image src={profile.avatarUrl} alt="avatar" width={80} height={80} />
        ) : null}
      </div>

      <div className="leading-tight w-full">
        <span className="font-medium">{profile.name}</span>
        <br />

        {profile.role === "client" ? (
          profile.companyName ? (
            <span className="text-xs text-slate-500">
              {profile.companyName}
            </span>
          ) : null
        ) : profile.role === "participant" ? (
          <span className="text-xs text-slate-500">
            {profile.points.toLocaleString()} pts
          </span>
        ) : null}
      </div>
    </Link>
  );
}
