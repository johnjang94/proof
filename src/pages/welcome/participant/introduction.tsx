"use client";

import { supabase } from "@/lib/supabaseInstance";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useRequireSession } from "@/lib/auth/useRequireSession";

type Step = 0 | 1 | 2;

export default function Introduction() {
  const router = useRouter();

  const ok = useRequireSession("/login?role=participant");
  const [fullName, setFullName] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (!ok) return;

    let alive = true;

    const clearTimers = () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
    };

    const startTimeline = () => {
      setStep(0);

      timersRef.current.push(
        window.setTimeout(() => alive && setStep(1), 2000),
      );
      timersRef.current.push(
        window.setTimeout(() => alive && setStep(2), 4000),
      );
      timersRef.current.push(
        window.setTimeout(() => {
          if (!alive) return;
          setFadeOut(true);
        }, 6000),
      );
      timersRef.current.push(
        window.setTimeout(() => {
          if (!alive) return;
          router.replace("/welcome/participant/to-do");
        }, 8500),
      );
    };

    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("first_name,last_name")
        .eq("id", user.id)
        .single();

      if (!alive) return;

      const name = [data?.first_name, data?.last_name]
        .filter(Boolean)
        .join(" ");
      setFullName(name || null);

      window.setTimeout(() => {
        if (alive) setFadeIn(true);
      }, 50);

      startTimeline();
    };

    load();

    return () => {
      alive = false;
      clearTimers();
    };
  }, [ok, router]);

  if (!ok) return null;

  return (
    <div
      className={[
        "relative flex min-h-[70vh] flex-col items-center justify-center text-center",
        "transition-opacity duration-1000 ease-in-out",
        fadeOut ? "opacity-0" : fadeIn ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <h1
        className={[
          "absolute text-4xl font-medium transition-all duration-700 ease-out",
          step === 0 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
        ].join(" ")}
      >
        Hi{fullName ? `, ${fullName}` : ""}
      </h1>

      <h1
        className={[
          "absolute text-4xl font-medium tracking-tight transition-all duration-700 ease-out",
          step >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        ].join(" ")}
      >
        Welcome to PROOF
      </h1>

      <p
        className={[
          "mt-14 text-lg text-neutral-700 transition-all duration-700 ease-out",
          step === 2 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
        ].join(" ")}
      >
        the platform where you get the real experience
      </p>
    </div>
  );
}
