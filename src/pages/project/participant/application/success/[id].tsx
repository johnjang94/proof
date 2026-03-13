"use client";

import { useRouter } from "next/router";

export default function Success() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f7f9f7] px-5 py-10 text-[#111111]">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white border border-[#e5e7eb] px-8 py-10 shadow-sm text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-emerald-500">
              <svg
                className="h-8 w-8 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <p className="mb-2 text-[22px] font-semibold tracking-[-0.02em]">
            Application submitted.
          </p>
          <p className="mb-1 text-[15px] text-[#444444] leading-relaxed">
            We will reach out to you in the near future.
          </p>
          <p className="mb-8 text-[13px] text-[#999999]">
            Your information has been securely submitted.
          </p>

          <button
            type="button"
            onClick={() => router.push("/main/participant/landing")}
            className="rounded-xl bg-[#111111] px-10 py-3 text-[15px] font-semibold text-white transition hover:opacity-90 hover:cursor-pointer"
          >
            Go Home
          </button>
        </div>
      </div>
    </main>
  );
}
