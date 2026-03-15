"use client";

import { apiFetch } from "@/lib/apiFetch";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useRequireSession } from "@/lib/auth/useRequireSession";

type Step = 0 | 1 | 2;

export default function Introduction() {
  const router = useRouter();

  const ok = useRequireSession("/login?role=client");
  const [fullName, setFullName] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(0);
  const [fadeOut, setFadeOut] = useState(false);

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
          router.replace("/welcome/client/to-do");
        }, 8500),
      );
    };

    const load = async () => {
      const res = await apiFetch("/auth/me");
      if (!alive) return;

      const user = res.ok ? await res.json() : null;

      setFullName(user?.firstName || null);

      await new Promise((r) => requestAnimationFrame(r));

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
        "transition-opacity duration-3000 ease-in-out",
        fadeOut ? "opacity-0" : "opacity-100",
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
        Where you get matched with talents
      </p>
    </div>
  );
}
