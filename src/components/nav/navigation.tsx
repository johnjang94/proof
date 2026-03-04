import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoCartOutline } from "react-icons/io5";
import { MdOutlineNotificationsNone } from "react-icons/md";
import ProfileSlot from "../nav-photos/profile-slot";

type NavVariant = "participant" | "client";

export default function TopNav({ variant }: { variant: NavVariant }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  const showHamburger = variant === "participant";
  const showClientIcons = variant === "client";

  const searchWidthClass = variant === "client" ? "w-5/6" : "w-full";

  const menuItems = useMemo(
    () => [
      { href: "/category/shopping", label: "Shopping" },
      { href: "/category/jobs", label: "Jobs" },
    ],
    [],
  );

  return (
    <div className="relative flex items-center gap-1.5 px-5">
      <div ref={menuRef} className="relative">
        {showHamburger && (
          <button
            type="button"
            className="hidden sm:block"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <RxHamburgerMenu className="text-3xl hover:cursor-pointer" />
          </button>
        )}

        <div
          className={[
            "absolute left-0 top-12 z-50 w-96 overflow-hidden rounded-xl bg-white shadow-lg",
            "origin-top transition-all duration-200 ease-out",
            open
              ? "pointer-events-auto translate-y-0 scale-y-100 opacity-100"
              : "pointer-events-none -translate-y-2 scale-y-0 opacity-0",
          ].join(" ")}
          role="menu"
          aria-hidden={!open}
        >
          {menuItems.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="block px-4 py-3 text-sm hover:bg-slate-100"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              {it.label}
            </Link>
          ))}
        </div>
      </div>

      <Link href="/" className="shrink-0">
        <Image src="/logo.png" alt="logo" width={64} height={64} priority />
      </Link>

      <div className="flex flex-1 items-center gap-1.5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search..."
          className={`${searchWidthClass} rounded-xl border border-slate-400 px-3 py-1.5`}
        />
        <div className="shrink-0 relative z-10">
          <ProfileSlot />
        </div>
      </div>

      {showClientIcons && (
        <div className="flex items-center gap-1.5">
          <IoCartOutline className="text-4xl" />
          <MdOutlineNotificationsNone className="text-4xl" />
        </div>
      )}
    </div>
  );
}
