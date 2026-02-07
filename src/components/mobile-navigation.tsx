import Link from "next/link";
import { useRouter } from "next/router";

import { IoHomeOutline } from "react-icons/io5";
import { FiShoppingBag } from "react-icons/fi";
import { BsSuitcaseLg } from "react-icons/bs";
import { CiChat1 } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";

const tabs = [
  { href: "/", label: "Home", icon: <IoHomeOutline className="text-3xl" /> },
  {
    href: "/category/shopping",
    label: "Shopping",
    icon: <FiShoppingBag className="text-3xl" />,
  },
  {
    href: "/category/jobs",
    label: "Jobs",
    icon: <BsSuitcaseLg className="text-3xl" />,
  },
  {
    href: "/category/chat",
    label: "Chat",
    icon: <CiChat1 className="text-3xl" />,
  },
  {
    href: "/category/profile",
    label: "Profile",
    icon: <CgProfile className="text-3xl" />,
  },
];

export default function BottomBar() {
  const router = useRouter();

  const isActive = (href: string) =>
    href === "/" ? router.pathname === "/" : router.pathname.startsWith(href);

  return (
    <nav>
      <div className="mx-auto max-w-6xl px-2 py-2 grid grid-cols-5">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`flex h-14 w-full flex-col items-center justify-center rounded ${
              isActive(t.href) ? "font-semibold opacity-100" : "opacity-70"
            }`}
          >
            <span className="text-3xl leading-none">{t.icon}</span>
            <span className="mt-1 text-[11px] leading-none">{t.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
