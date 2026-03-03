"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { FiCompass, FiZap, FiArrowRight } from "react-icons/fi";

type SetupType = "self" | "guided";

export default function ProjectSetup() {
  const router = useRouter();
  const [selected, setSelected] = useState<SetupType | null>(null);

  const cardStyle = (type: SetupType) =>
    [
      "group w-full rounded-xl border px-10 py-10 text-left",
      "transition-all duration-200 ease-in-out hover:cursor-pointer",
      selected === type
        ? "border-green-500 bg-green-50 text-green-500"
        : "border-gray-300 bg-white text-black hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-700",
    ].join(" ");

  const iconStyle = (type: SetupType) =>
    selected === type
      ? "text-green-500"
      : "text-gray-700 group-hover:text-emerald-700";

  return (
    <div className="min-h-[85vh]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight">
            Choose your project set up
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Select the approach that best fits your needs
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setSelected("self")}
            className={cardStyle("self")}
          >
            <div className="flex items-start gap-4">
              <FiZap className={`text-2xl ${iconStyle("self")}`} />

              <div>
                <h2 className="text-3xl font-semibold">Self-Managed</h2>

                <p className="mt-4 text-lg">
                  For experienced clients who wants direct control
                </p>

                <ul className="mt-5 list-disc space-y-2 pl-5">
                  <li>Direct control over all project aspects</li>
                  <li>Custom milestone set up and tracking</li>
                  <li>Fast execution with minimal oversight</li>
                </ul>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelected("guided")}
            className={cardStyle("guided")}
          >
            <div className="flex items-start gap-4">
              <FiCompass className={`text-2xl ${iconStyle("guided")}`} />

              <div>
                <h2 className="text-3xl font-semibold">Guided Set-Up</h2>

                <p className="mt-4 text-lg">
                  For first-time clients who prefers a structured support
                </p>

                <ul className="mt-5 list-disc space-y-2 pl-5">
                  <li>Structured scoping and planning process</li>
                  <li>Dedicated HR support throughout the project</li>
                  <li>Step-by-Step guidance and best practices</li>
                </ul>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-14 flex justify-center">
          <button
            disabled={!selected}
            onClick={() => router.push("/project/client/application/guided")}
            className={[
              "inline-flex items-center gap-3 rounded-lg px-10 py-4 text-lg font-medium transition hover:cursor-pointer",
              selected
                ? "bg-gray-200 hover:bg-gray-300"
                : "bg-gray-100 text-gray-400 cursor-not-allowed",
            ].join(" ")}
          >
            Continue
            <FiArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
