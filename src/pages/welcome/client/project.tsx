"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Project() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={[
        "relative min-h-screen bg-neutral-50 transition-opacity duration-700",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <div className="absolute left-1/2 top-6 -translate-x-1/2">
        <div className="rounded-full border border-gray-300 bg-white px-6 py-2 text-sm text-neutral-800 shadow-sm">
          Whether you are in DIY mode or in guided mode, you will need to fill
          out project application
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-8 pt-28 pb-20">
        <div className="rounded-md border bg-white px-6 py-4 shadow-sm">
          <h1 className="text-lg font-semibold tracking-wide">
            PROJECT INTAKE
          </h1>
        </div>

        <div className="mt-8 space-y-8">
          <section className="rounded-md border bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold">Project Information</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Our HR team will review and structure your project to ensure
              optimal resource alignment and execution strategy.
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <label className="font-medium">Name of the project</label>
                  <button className="rounded-md border px-3 py-1 text-sm">
                    Edit
                  </button>
                </div>
                <input
                  className="mt-2 w-full rounded-md border px-4 py-3 text-sm"
                  defaultValue="Enterprise CRM Integration & Data Migration"
                  readOnly
                />
              </div>

              <div>
                <label className="font-medium">
                  How much time would you invest in this project?
                </label>
                <select
                  className="mt-2 w-full rounded-md border px-4 py-3 text-sm bg-white"
                  defaultValue="4 months"
                  disabled
                >
                  <option>4 months</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="font-medium">Estimated Budget Range</label>
                  <button className="rounded-md border px-3 py-1 text-sm">
                    Edit
                  </button>
                </div>
                <input
                  className="mt-2 w-full rounded-md border px-4 py-3 text-sm"
                  defaultValue="$85,000 - $120,000"
                  readOnly
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="font-medium">Project Description</label>
                  <button className="rounded-md border px-3 py-1 text-sm">
                    Edit
                  </button>
                </div>
                <textarea
                  className="mt-2 w-full rounded-md border px-4 py-3 text-sm"
                  rows={5}
                  readOnly
                  defaultValue="We are seeking to implement a centralized enterprise CRM solution to consolidate fragmented customer data across multiple legacy systems. The project includes data migration, system integration with existing ERP and marketing tools, and workflow standardization for our sales team. The goal is to improve pipeline visibility, reporting accuracy, and overall operational efficiency."
                />
              </div>

              <div>
                <label className="font-medium">
                  Project Description (MP4)
                  <span className="ml-2 text-sm text-neutral-500">
                    optional
                  </span>
                </label>

                <div className="mt-2 flex flex-col items-center justify-center rounded-md border border-dashed bg-neutral-100 py-12 text-center">
                  <div className="text-3xl">⬆</div>
                  <p className="mt-2 text-sm font-medium">
                    Drag & Drop your photo here
                  </p>
                  <p className="text-xs text-neutral-500">
                    ...or click here to browse
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    supported file types: .jpg, .png
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="font-medium">
                    What are your goals for this project?
                  </label>
                  <button className="rounded-md border px-3 py-1 text-sm">
                    Edit
                  </button>
                </div>
                <textarea
                  className="mt-2 w-full rounded-md border px-4 py-3 text-sm"
                  rows={3}
                  readOnly
                  defaultValue="To centralize customer data, improve pipeline transparency, and create a scalable CRM foundation that enhances enterprise sales performance and decision-making."
                />
              </div>

              <div>
                <label className="font-medium">Project Thumbnail</label>

                <div className="mt-2 flex flex-col items-center justify-center rounded-md border border-dashed bg-neutral-100 py-12 text-center">
                  <div className="text-3xl">⬆</div>
                  <p className="mt-2 text-sm font-medium">
                    Drag & Drop your photo here
                  </p>
                  <p className="text-xs text-neutral-500">
                    ...or click here to browse
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    supported file types: .jpg, .png
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex items-center justify-between">
              <button className="rounded-md border px-4 py-2 text-sm">
                ← Previous
              </button>
              <button className="rounded-md bg-blue-500 px-6 py-2 text-sm text-white hover:bg-blue-600">
                Save
              </button>
            </div>
          </section>
        </div>
      </main>
      <div className="text-center my-10">
        <button
          className="bg-blue-300 hover:bg-blue-700 w-4/6 py-1 rounded-xl text-white hover:cursor-pointer"
          onClick={() => router.push("/welcome/client/review")}
        >
          Next
        </button>
      </div>
    </div>
  );
}
