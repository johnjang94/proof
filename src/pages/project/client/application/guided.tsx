"use client";

import { useId, useState } from "react";

export default function ProjectIntake() {
  const id = useId();

  const [projectName, setProjectName] = useState("");
  const [timeInvestment, setTimeInvestment] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [goals, setGoals] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  async function handleSubmit() {
    const res = await fetch(`${API_BASE}/project-intakes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientUserId: "test-user-1",
        email: "test@test.com",
        projectName,
        timeInvestment,
        budgetRange,
        projectDescription,
        goals,
      }),
    });

    const data = await res.json();
    console.log(data);
  }

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
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
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
                  value={timeInvestment}
                  onChange={(e) => setTimeInvestment(e.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
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
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
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
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="i.e. (company name) is (a platform / a website / a product) that offers (service / product)."
                  className="mt-2 w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                />
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
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="i.e. I hope to achieve..."
                  className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                />
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
                  onClick={handleSubmit}
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
