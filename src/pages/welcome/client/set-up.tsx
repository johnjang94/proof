"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useRequireSession } from "@/lib/auth/useRequireSession";

type SetupMode = "self" | "guided";

export default function SetUp() {
  const router = useRouter();

  const ok = useRequireSession("/login?role=client");
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [mode, setMode] = useState<SetupMode | null>(null);

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

  const continueLabel = useMemo(() => "Continue", []);

  const navigateWithFade = (path: string) => {
    if (leaving) return;
    setLeaving(true);

    navTimerRef.current = window.setTimeout(() => {
      router.push(path);
    }, 450);
  };

  const onContinue = () => {
    if (!mode) return;
    navigateWithFade(`/client/project-intake?mode=${mode}`);
  };

  const onNext = () => {
    navigateWithFade("/welcome/client/project");
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
          You will be given a choice to do everything in DIY mode or in guided
          mode
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-10 pt-28">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight">
            Choose your project set up
          </h1>
          <p className="mt-2 text-lg text-neutral-700">
            Select the approach that best fits your needs
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("self")}
            disabled={leaving}
            className={[
              "group w-full rounded-md border bg-white px-10 py-10 text-left shadow-sm transition",
              "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2",
              leaving ? "cursor-not-allowed opacity-80" : "",
              mode === "self" ? "border-neutral-900" : "border-neutral-300",
            ].join(" ")}
            aria-pressed={mode === "self"}
          >
            <div className="flex items-start gap-4">
              <div
                className={[
                  "mt-1 flex h-11 w-11 items-center justify-center rounded-full border",
                  mode === "self" ? "border-neutral-900" : "border-neutral-300",
                ].join(" ")}
                aria-hidden="true"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-neutral-900"
                >
                  <path
                    d="M13 2L3 14h8l-1 8 11-14h-8l0-6z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="min-w-0">
                <h2 className="text-3xl font-semibold tracking-tight">
                  Self-Managed
                </h2>
                <p className="mt-2 text-neutral-700">
                  For experienced clients who wants direct control
                </p>

                <ul className="mt-5 list-disc space-y-2 pl-5 text-neutral-700">
                  <li>Direct control over all project aspects</li>
                  <li>Custom milestone set up and tracking</li>
                  <li>Fast execution with minimal oversight</li>
                </ul>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMode("guided")}
            disabled={leaving}
            className={[
              "group w-full rounded-md border bg-white px-10 py-10 text-left shadow-sm transition",
              "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2",
              leaving ? "cursor-not-allowed opacity-80" : "",
              mode === "guided" ? "border-neutral-900" : "border-neutral-300",
            ].join(" ")}
            aria-pressed={mode === "guided"}
          >
            <div className="flex items-start gap-4">
              <div
                className={[
                  "mt-1 flex h-11 w-11 items-center justify-center rounded-full border",
                  mode === "guided"
                    ? "border-neutral-900"
                    : "border-neutral-300",
                ].join(" ")}
                aria-hidden="true"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-neutral-900"
                >
                  <path
                    d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M12 6v6l4 2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="min-w-0">
                <h2 className="text-3xl font-semibold tracking-tight">
                  Guided Set-Up
                </h2>
                <p className="mt-2 text-neutral-700">
                  For first-time clients who prefers a structured support
                </p>

                <ul className="mt-5 list-disc space-y-2 pl-5 text-neutral-700">
                  <li>Structured scoping and planning process</li>
                  <li>Dedicated HR support throughout the project</li>
                  <li>Step-by-Step guidance and best practices</li>
                </ul>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-14 flex justify-center pb-16">
          <button
            type="button"
            onClick={onContinue}
            disabled={!mode || leaving}
            className={[
              "flex items-center justify-center gap-3 rounded-md px-16 py-5 text-lg font-medium transition",
              !mode || leaving
                ? "cursor-not-allowed bg-neutral-200 text-neutral-500"
                : "bg-neutral-200 text-neutral-900 hover:bg-neutral-300",
            ].join(" ")}
          >
            {leaving ? "Moving..." : continueLabel}
            <span aria-hidden="true" className="text-xl">
              →
            </span>
          </button>
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
          onClick={onNext}
          disabled={leaving}
        >
          {leaving ? "Moving..." : "Next"}
        </button>
      </div>
    </div>
  );
}
