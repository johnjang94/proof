import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CgProfile } from "react-icons/cg";
import { apiFetch } from "@/lib/apiFetch";

type AuthUser = {
  id: string;
  email?: string;
} | null;

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
      if (!authUser) return;

      const res = await apiFetch("/auth/me");
      if (!mounted) return;

      const p = res.ok ? await res.json() : null;
      if (!p) {
        setProfile(null);
        return;
      }

      const first = (p.firstName ?? "").trim();
      const last = (p.lastName ?? "").trim();
      const fullName = [first, last].filter(Boolean).join(" ").trim();

      setProfile({
        name: fullName || "User",
        companyName: (p.company?.name ?? "").trim() || null,
        role: p.role ?? null,
        avatarUrl:
          normalizeAvatarUrl(p.avatarUrl) ??
          normalizeAvatarUrl(p.avatarPath) ??
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
    if (!profile) return "#";
    if (profile.role === "client") return "/category/profile/client";
    return "/category/profile/participant";
  }, [authUser, profile]);

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
