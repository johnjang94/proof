"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseInstance";
import { useRequireSession } from "@/lib/auth/useRequireSession";

export default function WrapUp() {
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

  const goLogin = async () => {
    if (leaving) return;
    setLeaving(true);

    navTimerRef.current = window.setTimeout(async () => {
      try {
        await supabase.auth.signOut();
      } finally {
        router.replace("/login?role=client&from=signup");
      }
    }, 450);
  };

  if (!ok) return null;

  return (
    <div
      className={[
        "my-40 text-center space-y-20 transition-opacity duration-500 ease-in-out",
        visible && !leaving ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <h1 className="text-3xl">Now, are you ready to have some fun with us?</h1>

      <div className="text-center my-10">
        <button
          className={[
            "w-1/6 py-1 rounded-xl text-white transition",
            leaving
              ? "bg-blue-300/60 cursor-not-allowed"
              : "bg-blue-300 hover:bg-blue-700 hover:cursor-pointer",
          ].join(" ")}
          onClick={goLogin}
          disabled={leaving}
        >
          {leaving ? "One sec..." : "Next"}
        </button>
      </div>
    </div>
  );
}
