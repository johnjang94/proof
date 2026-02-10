import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { IoHomeOutline, IoHomeSharp, IoChatboxSharp } from "react-icons/io5";
import { FiShoppingBag } from "react-icons/fi";
import { RiShoppingBag3Fill } from "react-icons/ri";
import { BsSuitcaseLg } from "react-icons/bs";
import { FaSuitcase } from "react-icons/fa";
import { CiChat1 } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";

import type { IconType } from "react-icons";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

type Tab = {
  href: string;
  label: string;
  off: IconType;
  on: IconType;
};

const tabs: Tab[] = [
  { href: "/", label: "Home", off: IoHomeOutline, on: IoHomeSharp },
  {
    href: "/category/shopping",
    label: "Shopping",
    off: FiShoppingBag,
    on: RiShoppingBag3Fill,
  },
  {
    href: "/category/jobs",
    label: "Jobs",
    off: BsSuitcaseLg,
    on: FaSuitcase,
  },
  {
    href: "/category/chat",
    label: "Chat",
    off: CiChat1,
    on: IoChatboxSharp,
  },
];

export default function BottomBar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const syncUser = (u: User | null) => {
      setUser(u);

      const url =
        (u?.user_metadata?.avatar_url as string | undefined) ??
        (u?.user_metadata?.picture as string | undefined) ??
        null;

      setAvatarUrl(url);
    };

    supabase.auth.getUser().then(({ data }) => {
      syncUser(data.user ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      syncUser(session?.user ?? null);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const isActive = (href: string) =>
    href === "/" ? router.pathname === "/" : router.pathname.startsWith(href);

  const profileHref = user ? "/category/profile" : "/category/login";
  const profileActive = isActive(profileHref);

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-5 px-2 py-2">
        {tabs.map(({ href, label, off, on }) => {
          const active = isActive(href);
          const Icon = active ? on : off;

          return (
            <Link
              key={href}
              href={href}
              className={`flex h-14 flex-col items-center justify-center ${
                active ? "text-black" : "text-gray-400"
              }`}
            >
              <Icon className="text-3xl" />
              <span className="mt-1 text-lg">{label}</span>
            </Link>
          );
        })}

        <Link
          href={profileHref}
          className={`flex h-14 flex-col items-center justify-center ${
            profileActive ? "text-black" : "text-gray-400"
          }`}
        >
          {user && avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="avatar"
              className="h-8 w-8 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <CgProfile className="text-3xl" />
          )}
          <span className="mt-1 text-lg">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
