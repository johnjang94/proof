"use client";

import { useRouter } from "next/router";
import type { IconType } from "react-icons";

type ComingSoonProps = {
  title: string;
  subtitle: string;
  badge?: string;
  icon: IconType;
};

export default function ComingSoon({
  title,
  subtitle,
  badge = "Coming Soon",
  icon: Icon,
}: ComingSoonProps) {
  const router = useRouter();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fafc] px-4 pb-24 pt-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10px -top-10 h-48 w-48 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute -right-5 top-24 h-44 w-44 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute bottom-16 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-md">
        <section className="overflow-hidden rounded-4xl border border-white/70 bg-white/75 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="bg-linear-to-br from-neutral-950 via-neutral-900 to-neutral-800 px-6 pb-10 pt-8 text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
              {badge}
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <Icon className="text-3xl" />
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.03em]">
              {title}
            </h1>

            <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">
              {subtitle}
            </p>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Status
                </p>
                <p className="mt-2 text-sm font-medium text-neutral-800">
                  We’re polishing the experience.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Preview
                </p>
                <p className="mt-2 text-sm text-neutral-600">
                  A cleaner flow, stronger visuals, and a much smoother mobile
                  experience are on the way.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-5 w-full rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Go to Home
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
