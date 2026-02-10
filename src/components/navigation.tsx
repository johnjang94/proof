import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  name: string;
  avatarUrl?: string | null;
  points: number;
};

export default function Top() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;

      const u = data.user ?? null;
      setUser(u);

      if (!u) {
        setProfile(null);
        return;
      }

      const name =
        (u.user_metadata?.full_name as string | undefined) ||
        (u.user_metadata?.name as string | undefined) ||
        (u.email ? u.email.split("@")[0] : "User");

      const avatarUrl =
        (u.user_metadata?.avatar_url as string | undefined) || null;

      setProfile({ name, avatarUrl, points: 0 });
    };

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);

      if (!u) {
        setProfile(null);
        return;
      }

      const name =
        (u.user_metadata?.full_name as string | undefined) ||
        (u.user_metadata?.name as string | undefined) ||
        (u.email ? u.email.split("@")[0] : "User");

      const avatarUrl =
        (u.user_metadata?.avatar_url as string | undefined) || null;

      setProfile({ name, avatarUrl, points: 0 });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="relative flex items-center gap-1.5 p-8">
      <div ref={menuRef} className="relative">
        <button
          className="hidden sm:block"
          aria-label="Open menu"
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <RxHamburgerMenu className="text-3xl hover:cursor-pointer" />
        </button>

        <div
          className={[
            "absolute left-0 top-12 z-50 w-96 overflow-hidden rounded-xl bg-white shadow-lg",
            "origin-top transition-all duration-200 ease-out",
            open
              ? "scale-y-100 opacity-100 translate-y-0 pointer-events-auto"
              : "scale-y-0 opacity-0 -translate-y-2 pointer-events-none",
          ].join(" ")}
          role="menu"
          aria-hidden={!open}
        >
          <Link
            href="/category/shopping"
            className="block px-4 py-3 text-sm hover:bg-slate-100"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            Shopping
          </Link>
          <Link
            href="/category/jobs"
            className="block px-4 py-3 text-sm hover:bg-slate-100"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            Jobs
          </Link>
        </div>
      </div>

      <Link href="/" className="shrink-0 flex items-center">
        <Image src="/logo.png" alt="logo" width={64} height={64} priority />
      </Link>

      <div className="flex items-center gap-1.5 flex-1">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search..."
          className="w-full rounded-xl px-3 py-1.5 border border-slate-400"
        />

        {user && profile ? (
          <Link
            href="/category/profile"
            className="hidden sm:flex items-center gap-2 rounded-xl p-2 hover:bg-slate-100"
            aria-label="Profile"
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
              <span className="text-xs text-slate-500">
                {profile.points.toLocaleString()} pts
              </span>
            </div>
          </Link>
        ) : (
          <Link
            href="/category/login"
            className="hidden sm:block cursor-pointer p-2"
            aria-label="Profile"
          >
            <CgProfile className="text-3xl" />
          </Link>
        )}
      </div>
    </div>
  );
}
