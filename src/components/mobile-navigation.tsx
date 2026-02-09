import Link from "next/link";
import { useRouter } from "next/router";

import { IoHomeOutline, IoHomeSharp, IoChatboxSharp } from "react-icons/io5";
import { FiShoppingBag } from "react-icons/fi";
import { RiShoppingBag3Fill } from "react-icons/ri";
import { BsSuitcaseLg } from "react-icons/bs";
import { FaSuitcase } from "react-icons/fa";
import { CiChat1 } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";

const tabs = [
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
  {
    href: "/category/login/profile-login",
    label: "Profile",
    off: CgProfile,
    on: CgProfile,
  },
];

export default function BottomBar() {
  const router = useRouter();

  const isActive = (href: string) =>
    href === "/" ? router.pathname === "/" : router.pathname.startsWith(href);

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
      </div>
    </nav>
  );
}
