"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useRequireSession } from "@/lib/auth/useRequireSession";

export default function ToDo() {
  const router = useRouter();

  const ok = useRequireSession("/login?role=client");
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const navTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!ok) return;

    const t = window.setTimeout(() => setVisible(true), 50);
    return () => window.clearTimeout(t);
  }, [ok]);

  useEffect(() => {
    return () => {
      if (navTimerRef.current) window.clearTimeout(navTimerRef.current);
    };
  }, []);

  const goNext = () => {
    if (leaving) return;
    setLeaving(true);

    navTimerRef.current = window.setTimeout(() => {
      router.push("/welcome/client/set-up");
    }, 450);
  };

  if (!ok) return null;

  return (
    <div
      className={[
        "relative min-h-[85vh] transition-opacity duration-500 ease-in-out",
        visible && !leaving ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <div className="absolute left-1/2 top-6 -translate-x-1/2">
        <div className="rounded-full border border-gray-300 bg-white px-6 py-2 text-sm text-neutral-900 shadow-sm">
          Start your journey by adding a new project
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-10 pt-28 cursor-not-allowed">
        <h1 className="text-4xl font-semibold tracking-tight">
          Welcome ACME Corp.,
        </h1>
        <p className="mt-2 text-lg text-neutral-700">
          Let’s get started on a project
        </p>

        <div className="mt-20 flex justify-center">
          <button className="flex items-center justify-center gap-2 rounded-md bg-neutral-200 px-16 py-8 text-lg text-neutral-900 cursor-not-allowed">
            <span className="text-2xl leading-none">+</span>
            New Project
          </button>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-12 text-center md:grid-cols-3">
          <p className="text-neutral-700">Weekly review included</p>
          <p className="text-neutral-700">Performance Tracking built-in</p>
          <p className="text-neutral-700">Hiring options available</p>
        </div>
      </main>

      <div className="text-center my-10">
        <button
          className={[
            "w-4/6 py-1 rounded-xl text-white transition",
            leaving
              ? "bg-blue-300/60 cursor-not-allowed"
              : "bg-blue-300 hover:bg-blue-700 hover:cursor-pointer",
          ].join(" ")}
          onClick={goNext}
          disabled={leaving}
        >
          {leaving ? "Moving..." : "Next"}
        </button>
      </div>
    </div>
  );
}
