import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";

export default function Top() {
  const [q, setQ] = useState("");

  return (
    <div className="flex items-center gap-1.5 p-8">
      <button className="hidden sm:block" aria-label="Open menu" type="button">
        <RxHamburgerMenu className="text-3xl" />
      </button>

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

        <button
          className="hidden sm:block cursor-pointer p-2"
          aria-label="Profile"
          type="button"
        >
          <CgProfile className="text-3xl" />
        </button>
      </div>
    </div>
  );
}
