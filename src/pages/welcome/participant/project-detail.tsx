"use client";

import WelcomeToDo from "@/components/welcome/welcome-todo";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRequireSession } from "@/lib/auth/useRequireSession";
import { CgProfile } from "react-icons/cg";
import { FaFire } from "react-icons/fa";

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
};

type Project = {
  id: string;
  badge: "Demo" | "New" | null;
  isHot: boolean;
  title: string;
  thumbnail: string;
  companyName: string;
  companyLogo: string;
  category: string;
  aboutProject: string[];
  lookingFor: string;
  commitmentPeriod: string;
  reviews: Review[];
};

const mockProject: Project = {
  id: "1",
  badge: "Demo",
  isHot: true,
  title: "Optimizing Last-Mile Delivery Efficiency in Downtown Toronto",
  thumbnail:
    "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=400&fit=crop",
  companyName: "Nexus Logistics",
  companyLogo:
    "https://ui-avatars.com/api/?name=NL&background=1a1a2e&color=fff&size=32",
  category: "DESIGN",
  aboutProject: [
    "Nexus Logistics is a platform that seeks to improve everyone's everyday life. They are currently optimizing last-mile delivery logistics to make urban living more seamless.",
    "By leveraging real-time traffic data and route optimization, they solve the congestion bottleneck in high-density areas like Downtown Toronto. The goal is to slash delivery times by 30% while maintaining 100% compliance with local traffic safety regulations.",
  ],
  lookingFor: "UX Designer",
  commitmentPeriod: "6 months",
  reviews: [
    {
      id: "1",
      name: "Alexa Kowinski",
      rating: 3.5,
      comment:
        "This program gave me an invaluable experience in developing my career as a UX Designer. You get to meet a group of highly-committed individuals...",
    },
    {
      id: "2",
      name: "Alexa Kowinski",
      rating: 3.5,
      comment:
        "This program gave me an invaluable experience in developing my career as a UX Designer. You get to meet a group of highly-committed individuals...",
    },
    {
      id: "3",
      name: "Alexa Kowinski",
      rating: 3.5,
      comment:
        "This program gave me an invaluable experience in developing my career as a UX Designer. You get to meet a group of highly-committed individuals...",
    },
  ],
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={
            star <= Math.floor(rating)
              ? "text-yellow-400"
              : star - 0.5 <= rating
                ? "text-yellow-300"
                : "text-gray-300"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function DemoProjectDetail() {
  const ok = useRequireSession("/login?role=participant");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (!ok) return;
    const t = window.setTimeout(() => setFadeIn(true), 50);
    return () => window.clearTimeout(t);
  }, [ok]);

  if (!ok) return null;

  const project = mockProject;

  const handleApply = () => {
    if (applied || applying) return;
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      setApplied(true);
    }, 800);
  };

  const handleBeforeNavigate = async () => {
    setFadingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  return (
    <div
      style={{ transition: "opacity 0.5s ease-in-out" }}
      className={[
        "mx-auto w-full max-w-5xl px-4 pb-16 my-5",
        fadeIn && !fadingOut ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <div className="mb-4 rounded-full border border-gray-300 bg-white px-5 py-2 text-sm text-neutral-700 shadow-sm mx-auto text-center">
        ..and you will learn further regarding the project as you go through
      </div>
      <div className="mb-4 flex items-center gap-2 text-sm text-neutral-500">
        <span className="font-medium text-neutral-700">{project.category}</span>
        <span>›</span>
        <Image
          src={project.companyLogo}
          alt={project.companyName}
          width={20}
          height={20}
          className="h-5 w-5 rounded-full object-cover"
        />
        <span>{project.companyName}</span>
      </div>
      <div className="mb-5 overflow-hidden rounded-2xl">
        <Image
          src={project.thumbnail}
          alt={project.title}
          width={800}
          height={400}
          className="h-64 w-full object-cover sm:h-80"
        />
      </div>
      <div className="mb-5 flex items-center gap-2">
        {project.badge && (
          <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
            {project.badge}
          </span>
        )}
        <h1 className="text-lg font-semibold leading-snug text-neutral-900">
          {project.title}
        </h1>
        {project.isHot && <FaFire className="shrink-0 text-orange-500" />}
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="mb-3 font-medium text-neutral-800">About the Project</p>
          {project.aboutProject.map((para, i) => (
            <p key={i} className="mb-2 text-sm text-neutral-600 last:mb-0">
              {para}
            </p>
          ))}
        </div>
        <div className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">Looking for</span>
              <span className="text-sm font-medium text-neutral-900">
                {project.lookingFor}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">
                Required commitment period
              </span>
              <span className="text-sm font-medium text-neutral-900">
                {project.commitmentPeriod}
              </span>
            </div>
          </div>
          <button
            onClick={handleApply}
            disabled
            className={[
              "mt-6 w-full rounded-xl py-3 text-sm font-semibold text-white transition",
              applied
                ? "bg-green-500 cursor-not-allowed"
                : applying
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-400 cursor-not-allowed",
            ].join(" ")}
          >
            {applied ? "Applied ✓" : applying ? "Applying..." : "Apply to Join"}
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
        <h2 className="mb-4 text-base font-semibold text-neutral-800">
          What previous participants say...
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {project.reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-neutral-200 bg-white p-3"
            >
              <div className="mb-1 flex items-center gap-2">
                <CgProfile className="text-xl text-neutral-400" />
                <span className="text-sm font-medium text-neutral-800">
                  {review.name}
                </span>
              </div>
              <StarRating rating={review.rating} />
              <p className="mt-2 text-xs text-neutral-500">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
      <WelcomeToDo
        nextPath="/welcome/participant/zoom-call"
        onBeforeNavigate={handleBeforeNavigate}
      />
    </div>
  );
}
