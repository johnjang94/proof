"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Review() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={[
        "relative min-h-[85vh] transition-opacity duration-3000 ease-in-out",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <div className="absolute left-1/2 top-6 -translate-x-1/2">
        <div className="rounded-full border border-gray-300 bg-white px-6 py-2 text-sm text-neutral-900 shadow-sm">
          Once you submit, our team will thoroughly review your project
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-10 pt-28">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight">
            Your Request is Under Review
          </h1>
          <p className="mt-2 text-lg text-neutral-700">
            Our team is carefully reviewing your project and may reach out for
            clarification.
          </p>
        </div>

        <div className="mt-16 flex flex-col items-center gap-10 md:flex-row md:justify-center md:gap-28">
          <StatusItem
            label="Under Review"
            tone="neutral"
            icon={
              <svg
                width="46"
                height="46"
                viewBox="0 0 24 24"
                fill="none"
                className="text-neutral-900"
              >
                <path
                  d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            }
          />

          <StatusItem
            label="Clarification"
            tone="amber"
            icon={
              <svg
                width="46"
                height="46"
                viewBox="0 0 24 24"
                fill="none"
                className="text-amber-600"
              >
                <path
                  d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />

          <StatusItem
            label="Approved"
            tone="green"
            icon={
              <svg
                width="46"
                height="46"
                viewBox="0 0 24 24"
                fill="none"
                className="text-emerald-600"
              >
                <path
                  d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 4 12 14.01l-3-3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
        </div>

        <div className="mx-auto mt-10 w-full max-w-2xl">
          <div className="h-3 w-full rounded-full bg-slate-800/80">
            <div
              className="h-3 rounded-full bg-sky-500"
              style={{ width: "20%" }}
            />
          </div>
          <div className="mt-3 flex items-center justify-end">
            <span className="text-base font-medium text-neutral-900">
              20% completed
            </span>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2 text-neutral-900">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="text-neutral-900"
              >
                <path
                  d="M12 8v4l3 2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            </span>
            <span className="text-lg font-medium">Estimated Response Time</span>
          </div>
          <div className="text-lg text-neutral-700">Within 24 hours</div>
        </div>

        <div className="mt-12 flex justify-center pb-16">
          <button
            type="button"
            className="w-full max-w-lg rounded-md border-2 border-emerald-600 bg-white px-10 py-4 text-lg font-medium text-emerald-700 transition hover:bg-emerald-50 hover:cursor-not-allowed"
          >
            Home
          </button>
        </div>
      </main>
      <div className="text-center my-10">
        <button
          className="bg-blue-300 hover:bg-blue-700 w-4/6 py-1 rounded-xl text-white hover:cursor-pointer"
          onClick={() => router.push("/welcome/client/build")}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function StatusItem({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "neutral" | "amber" | "green";
}) {
  const labelClass =
    tone === "amber"
      ? "text-amber-600"
      : tone === "green"
        ? "text-emerald-600"
        : "text-neutral-900";

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4">{icon}</div>
      <div className={["text-lg font-medium", labelClass].join(" ")}>
        {label}
      </div>
    </div>
  );
}
