import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

import type { IconType } from "react-icons";
import { IoHomeOutline, IoHomeSharp, IoChatboxSharp } from "react-icons/io5";
import { FiShoppingBag } from "react-icons/fi";
import { RiShoppingBag3Fill } from "react-icons/ri";
import { BsSuitcaseLg } from "react-icons/bs";
import { FaSuitcase } from "react-icons/fa";
import { CiChat1 } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { useProfileBadge } from "../nav-photos/profile-photo";

type AuthUser = {
  id: string;
  email?: string;
} | null;

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

export default function MobileNav({ authUser }: { authUser: AuthUser }) {
  const router = useRouter();
  const { user, avatarUrl, initial } = useProfileBadge(authUser);

  const isActive = (href: string) =>
    href === "/" ? router.pathname === "/" : router.pathname.startsWith(href);

  const profileHref = user ? "/category/profile" : "/login";
  const profileActive = isActive("/category/profile") || isActive("/login");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-5 px-2 py-2">
        {tabs.map(({ href, label, off, on }) => {
          const active = isActive(href);
          const Icon = active ? on : off;

          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex h-14 flex-col items-center justify-center transition",
                active ? "text-black" : "text-gray-400",
              ].join(" ")}
            >
              <Icon className="text-3xl" />
              <span className="mt-1 text-[13px] font-medium">{label}</span>
            </Link>
          );
        })}

        <Link
          href={profileHref}
          className={[
            "flex h-14 flex-col items-center justify-center transition",
            profileActive ? "text-black" : "text-gray-400",
          ].join(" ")}
        >
          {user ? (
            avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="avatar"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
                referrerPolicy="no-referrer"
                unoptimized
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-medium text-white">
                {initial}
              </div>
            )
          ) : (
            <CgProfile className="text-3xl" />
          )}

          <span className="mt-1 text-[13px] font-medium">
            {user ? "My Profile" : "Profile"}
          </span>
        </Link>
      </div>
    </nav>
  );
}
