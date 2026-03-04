"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useRequireSession } from "@/lib/auth/useRequireSession";

type TimelineStep = {
  label: string;
  state: "done" | "current" | "todo";
};

export default function Dashboard() {
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

  const navigateWithFade = (path: string) => {
    if (leaving) return;
    setLeaving(true);

    navTimerRef.current = window.setTimeout(() => {
      router.push(path);
    }, 450);
  };

  const steps: TimelineStep[] = useMemo(
    () => [
      { label: "Kick-off", state: "done" },
      { label: "Discovery", state: "done" },
      { label: "Design", state: "current" },
      { label: "Build", state: "todo" },
      { label: "QA", state: "todo" },
      { label: "Launch", state: "todo" },
      { label: "Post-Launch", state: "todo" },
    ],
    [],
  );

  if (!ok) return null;

  return (
    <div
      className={[
        "relative min-h-[85vh] bg-white transition-opacity duration-500 ease-in-out",
        visible && !leaving ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <div className="absolute left-1/2 top-6 -translate-x-1/2">
        <div className="max-w-245 rounded-full border border-gray-300 bg-white px-6 py-2 text-sm text-neutral-900 shadow-sm">
          You will receive performance reports along with a few different
          indicators, and be able to monitor the project progress
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-10 pt-28 pb-16">
        <div className="text-left">
          <h1 className="text-4xl font-semibold tracking-tight">
            Mobile App Redesign Dashboard
          </h1>
          <p className="mt-2 text-lg text-neutral-700">
            Real-time visibility into project progress and team clarity
          </p>
        </div>

        <section className="mt-10 rounded-md border border-neutral-300 bg-white shadow-sm">
          <div className="px-6 pt-5 pb-4">
            <div className="text-2xl font-medium text-neutral-900">
              Sprint Timeline
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-10 gap-y-4">
              {steps.map((s) => (
                <TimelinePill key={s.label} step={s} />
              ))}
            </div>
          </div>
        </section>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <section className="rounded-md border border-neutral-300 bg-white shadow-sm">
            <div className="px-6 py-5">
              <div className="text-2xl font-medium text-neutral-900">
                Project Completion
              </div>

              <div className="mt-6 text-6xl font-medium tracking-tight text-neutral-900">
                8%
              </div>

              <div className="mt-6 text-xl font-medium text-emerald-700">
                On track for delivery
              </div>
            </div>
          </section>

          <section className="rounded-md border border-neutral-300 bg-white shadow-sm">
            <div className="px-6 py-5">
              <div className="text-2xl font-medium text-neutral-900">
                Budget Overview
              </div>

              <div className="mt-6 text-6xl font-medium tracking-tight text-neutral-900">
                $30,000
              </div>
              <div className="mt-3 text-xl font-medium text-emerald-700">
                of $450,000 allocated
              </div>

              <div className="mt-8">
                <div className="mx-auto h-5 w-full rounded-full bg-slate-800/80">
                  <div
                    className="h-5 rounded-full bg-sky-500"
                    style={{ width: "7%" }}
                  />
                </div>

                <div className="mt-5 flex items-center justify-between text-lg text-neutral-900">
                  <div>
                    Remaining{" "}
                    <span className="ml-2 font-medium">$ 420,000</span>
                  </div>
                  <div className="font-medium">93% available</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-4 rounded-md border border-neutral-300 bg-white shadow-sm">
          <div className="px-6 pt-5 pb-6">
            <div className="text-2xl font-medium text-neutral-900">
              Weekly Summary
            </div>
            <div className="mt-2 text-sm text-neutral-500">
              Week ending Feb 16, 2026
            </div>

            <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3">
              <div>
                <div className="text-lg font-medium text-emerald-700">
                  Key Highlights
                </div>
                <p className="mt-3 text-sm leading-6 text-emerald-700">
                  All sprint planning sessions completed with full team
                  alignment
                </p>
              </div>

              <div>
                <div className="text-lg font-medium text-amber-700">
                  Areas of Concern
                </div>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-amber-700">
                  <li>
                    Security requirements documentation delayed by{" "}
                    <span className="font-medium">3 days</span>
                  </li>
                  <li>
                    Test environment provisioning blocked pending infrastructure
                    approval
                  </li>
                </ul>
              </div>

              <div>
                <div className="text-lg font-medium text-sky-600">
                  Next Week Focus
                </div>
                <p className="mt-3 text-sm leading-6 text-sky-600">
                  Complete security audit, finalize API rate limiting strategy,
                  and prepare client demo presentation for Sprint 3 review.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="text-center my-10">
        <button
          className={[
            "w-4/6 py-1 rounded-xl text-white transition",
            leaving
              ? "bg-blue-300/60 cursor-not-allowed"
              : "bg-blue-300 hover:bg-blue-700 hover:cursor-pointer",
          ].join(" ")}
          onClick={() => navigateWithFade("/welcome/client/wrap-up")}
          disabled={leaving}
        >
          {leaving ? "Moving..." : "Next"}
        </button>
      </div>
    </div>
  );
}

function TimelinePill({ step }: { step: TimelineStep }) {
  const isDone = step.state === "done";
  const isCurrent = step.state === "current";

  const textClass = isDone
    ? "text-emerald-700"
    : isCurrent
      ? "text-neutral-900"
      : "text-neutral-900";

  return (
    <div className={["flex items-center gap-2 text-lg", textClass].join(" ")}>
      <span className={isCurrent ? "font-semibold" : "font-medium"}>
        {step.label}
      </span>

      {isDone && (
        <span
          className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-400 text-emerald-700"
          aria-hidden="true"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6 9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </div>
  );
}
