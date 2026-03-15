"use client";

import WelcomeToDo from "@/components/welcome/welcome-todo";
import { useState, useEffect } from "react";
import { useRequireSession } from "@/lib/auth/useRequireSession";

type Job = {
  id: string;
  title: string;
  description: string;
  remote: string;
  level: string;
  employmentType: string;
  location: string;
  category: string;
};

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Product Designer",
    description:
      "We are looking for a mid-level product designer to join our team.",
    remote: "100% remote",
    level: "Mid-Level",
    employmentType: "Full-Time",
    location: "Toronto, ON",
    category: "Design",
  },
  {
    id: "2",
    title: "Front-End Dev",
    description:
      "Proficient in web app tech stack such as Next.js, TypeScript, React and be able to communicate with back-end",
    remote: "100% remote",
    level: "Mid-Level",
    employmentType: "Full-Time",
    location: "Toronto, ON",
    category: "Engineering",
  },
  {
    id: "3",
    title: "Data Analyst",
    description:
      "Looking for a detail-oriented data analyst to help drive insights from large datasets.",
    remote: "Hybrid",
    level: "Junior",
    employmentType: "Full-Time",
    location: "Toronto, ON",
    category: "Data",
  },
  {
    id: "4",
    title: "Marketing Manager",
    description:
      "Lead our growth marketing efforts across digital channels and partnerships.",
    remote: "On-site",
    level: "Senior",
    employmentType: "Full-Time",
    location: "Toronto, ON",
    category: "Marketing",
  },
];

const categories = ["All", "Design", "Engineering", "Data", "Marketing"];
const levels = ["All", "Junior", "Mid-Level", "Senior"];
const employmentTypes = ["All", "Full-Time", "Part-Time", "Contract"];
const locations = ["All", "Toronto, ON", "Vancouver, BC", "Remote"];

export default function OpenPositions() {
  const ok = useRequireSession("/login?role=participant");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedEmploymentType, setSelectedEmploymentType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [fadeIn, setFadeIn] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (!ok) return;
    const t = window.setTimeout(() => setFadeIn(true), 50);
    return () => window.clearTimeout(t);
  }, [ok]);

  if (!ok) return null;

  const filtered = mockJobs.filter((job) => {
    if (selectedCategory !== "All" && job.category !== selectedCategory)
      return false;
    if (selectedLevel !== "All" && job.level !== selectedLevel) return false;
    if (
      selectedEmploymentType !== "All" &&
      job.employmentType !== selectedEmploymentType
    )
      return false;
    if (selectedLocation !== "All" && job.location !== selectedLocation)
      return false;
    return true;
  });

  const handleBeforeNavigate = async () => {
    setFadingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  return (
    <div
      style={{ transition: "opacity 0.5s ease-in-out" }}
      className={[
        "mx-auto max-w-5xl px-4 pb-20 my-5",
        fadeIn && !fadingOut ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <div className="mb-6 flex justify-center">
        <div className="rounded-xl border border-neutral-200 bg-white px-6 py-2.5 text-sm text-neutral-700 shadow-sm">
          Once you are done, you get opportunities to apply to real jobs
        </div>
      </div>
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-5xl font-light tracking-tight text-neutral-900">
            Open Positions
          </h1>
          <p className="text-sm text-neutral-500">
            Every role is an opportunity to build something extraordinary.
            <br />
            Build your legacy with us today.
          </p>
        </div>
        <div className="flex gap-6">
          <div className="w-48 shrink-0 space-y-3">
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedLevel("All");
                setSelectedEmploymentType("All");
                setSelectedLocation("All");
              }}
              className="w-full rounded-xl bg-neutral-200 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-300 transition"
            >
              All
            </button>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none"
            >
              <option value="All">Category</option>
              {categories.slice(1).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none"
            >
              <option value="All">Experience level</option>
              {levels.slice(1).map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <select
              value={selectedEmploymentType}
              onChange={(e) => setSelectedEmploymentType(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none"
            >
              <option value="All">Employment Type</option>
              {employmentTypes.slice(1).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none"
            >
              <option value="All">Location</option>
              {locations.slice(1).map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-2 content-start">
            {filtered.length === 0 ? (
              <div className="col-span-2 py-10 text-center text-sm text-neutral-400">
                No positions found.
              </div>
            ) : (
              filtered.map((job) => (
                <div
                  key={job.id}
                  className="rounded-xl border border-neutral-200 bg-white p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h2 className="text-base font-semibold text-neutral-900">
                      {job.title}
                    </h2>
                    <button className="shrink-0 rounded-xl border border-neutral-200 px-4 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition">
                      Apply
                    </button>
                  </div>
                  <p className="mb-4 text-sm text-neutral-500">
                    {job.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600">
                      📍 {job.remote}
                    </span>
                    <span className="flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600">
                      📈 {job.level}
                    </span>
                    <span className="flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600">
                      🗂 {job.employmentType}
                    </span>
                    <span className="flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600">
                      🏢 {job.location}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <WelcomeToDo
        nextPath="/welcome/participant/ready"
        onBeforeNavigate={handleBeforeNavigate}
      />
    </div>
  );
}
