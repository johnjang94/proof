"use client";

import { useId } from "react";

export default function ProjectIntake() {
  const id = useId();

  return (
    <div className="min-h-[85vh]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="border rounded-xl px-6 py-4 bg-white">
          <h1 className="text-sm font-semibold tracking-wide text-gray-900">
            PROJECT INTAKE
          </h1>
        </div>

        <div className="bg-gray-50 py-3">
          <div className="rounded-md px-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Project Information
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Our HR team will review and structure your project to ensure
                optimal resource alignment and execution strategy.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor={`${id}-name`}
                  className="block text-sm font-medium text-gray-900"
                >
                  Name of the project
                </label>
                <input
                  id={`${id}-name`}
                  type="text"
                  placeholder="i.e. Bloom the Flowers"
                  className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor={`${id}-time`}
                  className="block text-sm font-medium text-gray-900"
                >
                  How much time would you invest in this project?
                </label>
                <select
                  id={`${id}-time`}
                  className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Please choose
                  </option>
                  <option>1–3 hours/week</option>
                  <option>4–6 hours/week</option>
                  <option>7–10 hours/week</option>
                  <option>10+ hours/week</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor={`${id}-budget`}
                  className="block text-sm font-medium text-gray-900"
                >
                  Estimated Budget Range
                </label>
                <select
                  id={`${id}-budget`}
                  className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Please choose
                  </option>
                  <option>$500 – $1,000</option>
                  <option>$1,000 – $3,000</option>
                  <option>$3,000 – $7,500</option>
                  <option>$7,500+</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor={`${id}-desc`}
                  className="block text-sm font-medium text-gray-900"
                >
                  Project Description
                </label>
                <textarea
                  id={`${id}-desc`}
                  rows={5}
                  placeholder="i.e. (company name) is (a platform / a website / a product) that offers (service / product). We are here to (describe the purpose) and hope to achieve (goal)."
                  className="mt-2 w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Project Description (MP4)
                  </label>
                  <span className="rounded bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                    optional
                  </span>
                </div>

                <label
                  htmlFor={`${id}-mp4`}
                  className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 bg-gray-50 px-6 py-10 text-center hover:bg-gray-100"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-10 w-10 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 16V4" />
                    <path d="M7 9l5-5 5 5" />
                    <path d="M20 16v4H4v-4" />
                  </svg>
                  <div className="mt-3 text-sm font-medium text-gray-800">
                    Drag & Drop your video here
                  </div>
                  <div className="text-xs text-gray-500">
                    ...or click here to browse
                  </div>
                  <div className="mt-2 text-[11px] text-gray-500">
                    supported file type: .mp4
                  </div>
                  <input
                    id={`${id}-mp4`}
                    type="file"
                    accept="video/mp4"
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label
                  htmlFor={`${id}-goals`}
                  className="block text-sm font-medium text-gray-900"
                >
                  What are your goals for this project?
                </label>
                <input
                  id={`${id}-goals`}
                  type="text"
                  placeholder="i.e. I hope to achieve..."
                  className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Project Thumbnail
                </label>
                <label
                  htmlFor={`${id}-thumb`}
                  className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 bg-gray-50 px-6 py-10 text-center hover:bg-gray-100"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-10 w-10 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 16V4" />
                    <path d="M7 9l5-5 5 5" />
                    <path d="M20 16v4H4v-4" />
                  </svg>
                  <div className="mt-3 text-sm font-medium text-gray-800">
                    Drag & Drop your photo here
                  </div>
                  <div className="text-xs text-gray-500">
                    ...or click here to browse
                  </div>
                  <div className="mt-2 text-[11px] text-gray-500">
                    supported file types: .jpg, .png
                  </div>
                  <input
                    id={`${id}-thumb`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>

              <div className="mt-2 flex items-center justify-between pt-2">
                <button
                  type="button"
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
                >
                  &lt; Previous
                </button>

                <button
                  type="button"
                  className="rounded-md bg-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-600"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
