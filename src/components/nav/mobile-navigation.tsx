import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

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

  const [visible, setVisible] = useState(true);

  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const THRESHOLD = 12;
    const TOP_LOCK = 24;

    const updateNav = () => {
      const currentScrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;
      const delta = currentScrollY - lastScrollY;

      if (currentScrollY <= TOP_LOCK) {
        setVisible(true);
        lastScrollYRef.current = currentScrollY;
        tickingRef.current = false;
        return;
      }

      if (Math.abs(delta) < THRESHOLD) {
        tickingRef.current = false;
        return;
      }

      if (delta > 0) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
      tickingRef.current = false;
    };

    const handleScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        window.requestAnimationFrame(updateNav);
      }
    };

    lastScrollYRef.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleRouteDone = () => {
      setVisible(true);
      lastScrollYRef.current = window.scrollY;
    };

    router.events.on("routeChangeComplete", handleRouteDone);
    router.events.on("hashChangeComplete", handleRouteDone);

    return () => {
      router.events.off("routeChangeComplete", handleRouteDone);
      router.events.off("hashChangeComplete", handleRouteDone);
    };
  }, [router.events]);

  const isActive = (href: string) =>
    href === "/" ? router.pathname === "/" : router.pathname.startsWith(href);

  const profileHref = user ? "/category/profile/participant" : "/login";
  const profileActive = router.pathname === "/category/profile/participant";

  return (
    <nav
      className={[
        "fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white/95 backdrop-blur",
        "transition-transform duration-300 ease-out",
        visible ? "translate-y-0" : "translate-y-full",
      ].join(" ")}
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
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
