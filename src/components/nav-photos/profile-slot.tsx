import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CgProfile } from "react-icons/cg";
import { supabase } from "@/lib/supabaseInstance";

type AuthUser = {
  id: string;
  email?: string;
} | null;

type ProfileRow = {
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  role: string | null;
  points: number | null;
  avatar_url: string | null;
  avatar_path?: string | null;
};

type DisplayProfile = {
  name: string;
  companyName: string | null;
  role: string | null;
  avatarUrl: string | null;
  points: number;
};

function normalizeAvatarUrl(raw: string | null | undefined) {
  const value = (raw ?? "").trim();
  if (!value) return null;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const base = (process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? "").trim();
  if (!base) return null;

  const cleanPath = value.startsWith("/") ? value.slice(1) : value;
  return `${base.replace(/\/$/, "")}/${cleanPath}`;
}

export default function ProfileSlot({ authUser }: { authUser: AuthUser }) {
  const [profile, setProfile] = useState<DisplayProfile | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      if (!authUser) {
        setProfile(null);
        return;
      }

      const { data: p, error } = await supabase
        .from("profiles")
        .select(
          "first_name, last_name, company_name, role, points, avatar_url, avatar_path",
        )
        .eq("id", authUser.id)
        .maybeSingle<ProfileRow>();

      if (!mounted) return;

      if (error || !p) {
        setProfile(null);
        return;
      }

      const first = (p.first_name ?? "").trim();
      const last = (p.last_name ?? "").trim();
      const fullName = [first, last].filter(Boolean).join(" ").trim();

      setProfile({
        name: fullName || "User",
        companyName: (p.company_name ?? "").trim() || null,
        role: p.role ?? null,
        avatarUrl:
          normalizeAvatarUrl(p.avatar_url) ??
          normalizeAvatarUrl(p.avatar_path) ??
          null,
        points: p.points ?? 0,
      });
    };

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, [authUser]);

  const href = useMemo(() => {
    if (!authUser) return "/login";
    if (profile?.role === "client") return "/category/profile/client";
    return "/category/profile/participant";
  }, [authUser, profile?.role]);

  const label = useMemo(() => (authUser ? "Profile" : "Login"), [authUser]);

  if (!authUser || !profile) {
    return (
      <Link
        href={href}
        className="hidden cursor-pointer p-2 sm:block"
        aria-label={label}
      >
        <CgProfile className="text-3xl" />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="hidden items-center gap-2 rounded-xl p-2 hover:bg-slate-100 sm:flex"
      aria-label={label}
    >
      <div className="h-14 w-20 overflow-hidden rounded-4xl bg-slate-200">
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt="avatar"
            width={80}
            height={80}
            className="h-full w-full object-cover"
            unoptimized
          />
        ) : null}
      </div>

      <div className="w-full leading-tight">
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
