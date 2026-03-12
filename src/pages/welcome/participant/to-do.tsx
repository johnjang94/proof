"use client";

import WelcomeToDo from "@/components/welcome/welcome-todo";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRequireSession } from "@/lib/auth/useRequireSession";

type Badge = "Demo" | "New" | null;

type Project = {
  id: string;
  title: string;
  thumbnail: string;
  badge: Badge;
  isHot: boolean;
  companyName: string;
  companyLogo: string;
  timeAgo: string;
  views?: string;
};

const mockProjects: Project[] = [
  {
    id: "1",
    title: "Optimizing Last-Mile Delivery Efficiency in Downtown Toronto",
    thumbnail:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=250&fit=crop",
    badge: "Demo",
    isHot: true,
    companyName: "Nexus Logistics",
    companyLogo:
      "https://ui-avatars.com/api/?name=NL&background=1a1a2e&color=fff&size=32",
    timeAgo: "8 hours ago",
  },
  {
    id: "2",
    title: "Optimizing Smart Grid Algorithms for Sustainable Energy",
    thumbnail:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=250&fit=crop",
    badge: "Demo",
    isHot: false,
    companyName: "EcoTech Systems",
    companyLogo:
      "https://ui-avatars.com/api/?name=ES&background=2d6a4f&color=fff&size=32",
    timeAgo: "1 hour ago",
  },
  {
    id: "3",
    title: "2026 Toronto Real Estate Market Analysis & Data Visualization",
    thumbnail:
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=250&fit=crop",
    badge: "Demo",
    isHot: false,
    companyName: "Data Pulse Lab",
    companyLogo:
      "https://ui-avatars.com/api/?name=DP&background=6a0572&color=fff&size=32",
    timeAgo: "2 weeks ago",
  },
  {
    id: "4",
    title: "Fraud Detection System: Real-Time Transaction Monitoring Report",
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
    badge: "Demo",
    isHot: false,
    companyName: "FinTech Innovators",
    companyLogo:
      "https://ui-avatars.com/api/?name=FI&background=c62828&color=fff&size=32",
    timeAgo: "5 days ago",
  },
  {
    id: "5",
    title: "Customer Churn Prediction Model and Retention Strategy for 2026",
    thumbnail:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
    badge: "Demo",
    isHot: true,
    companyName: "Blue Horizon Retail",
    companyLogo:
      "https://ui-avatars.com/api/?name=BH&background=0277bd&color=fff&size=32",
    timeAgo: "13 days ago",
  },
  {
    id: "6",
    title: "Feasibility Study on EV Charging Station Expansion in GTA",
    thumbnail:
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=250&fit=crop",
    badge: "Demo",
    isHot: false,
    companyName: "Urban Infrastructure Group",
    companyLogo:
      "https://ui-avatars.com/api/?name=UI&background=37474f&color=fff&size=32",
    timeAgo: "3 hours ago",
  },
  {
    id: "7",
    title: "Learning $90B supply chain",
    thumbnail:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=250&fit=crop",
    badge: null,
    isHot: false,
    companyName: "Supply Co",
    companyLogo:
      "https://ui-avatars.com/api/?name=SC&background=4e342e&color=fff&size=32",
    timeAgo: "1 day ago",
    views: "383K views",
  },
  {
    id: "8",
    title: "3 Case Studies of Brand Storytelling That Gen Z Is Obsessed With",
    thumbnail:
      "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400&h=250&fit=crop",
    badge: null,
    isHot: false,
    companyName: "Brand Studio",
    companyLogo:
      "https://ui-avatars.com/api/?name=BS&background=880e4f&color=fff&size=32",
    timeAgo: "2 days ago",
    views: "2.5M views",
  },
  {
    id: "9",
    title: "A true craftsman doesn't blame the tools.",
    thumbnail:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=250&fit=crop",
    badge: null,
    isHot: false,
    companyName: "Craft Works",
    companyLogo:
      "https://ui-avatars.com/api/?name=CW&background=1b5e20&color=fff&size=32",
    timeAgo: "3 days ago",
    views: "500K views",
  },
  {
    id: "10",
    title: "Large-Scale Wind Farm Efficiency Report in Houston, Texas",
    thumbnail:
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=250&fit=crop",
    badge: "Demo",
    isHot: false,
    companyName: "Solaris Energy Corp.",
    companyLogo:
      "https://ui-avatars.com/api/?name=SE&background=f57f17&color=fff&size=32",
    timeAgo: "3 hours ago",
  },
  {
    id: "11",
    title: "Performance Simulation of Vertical Take-Off Drone Prototypes",
    thumbnail:
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=250&fit=crop",
    badge: "Demo",
    isHot: true,
    companyName: "Aero Dynamic Tech",
    companyLogo:
      "https://ui-avatars.com/api/?name=AD&background=283593&color=fff&size=32",
    timeAgo: "3 hours ago",
  },
  {
    id: "12",
    title:
      "Global Implementation of AI-Driven Early Diagnostic Tools for Rare Diseases",
    thumbnail:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=250&fit=crop",
    badge: "Demo",
    isHot: false,
    companyName: "BioGen Health Systems",
    companyLogo:
      "https://ui-avatars.com/api/?name=BG&background=004d40&color=fff&size=32",
    timeAgo: "3 hours ago",
  },
];

function BadgeChip({ badge }: { badge: Badge }) {
  if (!badge) return null;
  return (
    <span className="rounded px-2 py-0.5 text-xs font-semibold text-white bg-blue-600">
      {badge}
    </span>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative mb-2 aspect-video w-full overflow-hidden rounded-xl bg-neutral-200">
        <Image
          src={project.thumbnail}
          alt={project.title}
          width={400}
          height={250}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex items-start gap-2 px-0.5">
        <Image
          src={project.companyLogo}
          alt={project.companyName}
          width={32}
          height={32}
          className="mt-0.5 h-8 w-8 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5">
            <BadgeChip badge={project.badge} />
            {project.isHot && (
              <span className="rounded px-2 py-0.5 text-xs font-semibold text-white bg-red-500">
                🔥
              </span>
            )}
          </div>
          <h2 className="line-clamp-2 text-sm font-medium leading-snug text-neutral-900">
            {project.title}
          </h2>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
            <span className="truncate">{project.companyName}</span>
            {project.views && (
              <>
                <span className="text-neutral-300">·</span>
                <span>{project.views}</span>
              </>
            )}
          </div>
          <div className="mt-0.5 text-xs text-neutral-400">
            {project.timeAgo}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Todo() {
  const ok = useRequireSession("/login?role=participant");
  const [tooltip, setTooltip] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (!ok) return;
    const t = window.setTimeout(() => setFadeIn(true), 50);
    return () => window.clearTimeout(t);
  }, [ok]);

  if (!ok) return null;

  const handleBeforeNavigate = async () => {
    setFadingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  };

  return (
    <div
      style={{ transition: "opacity 2s ease-in-out" }}
      className={[
        "mx-auto w-full max-w-5xl px-4 pb-16 my-5",
        fadeIn && !fadingOut ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      {tooltip && (
        <div className="relative mb-6 flex items-center justify-center">
          <div className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm text-neutral-700 shadow-sm">
            You may begin your journey by checking out different projects that
            we offer you
          </div>
          <button
            type="button"
            onClick={() => setTooltip(false)}
            className="absolute right-0 text-neutral-400 hover:text-neutral-600 text-lg px-2"
          >
            ×
          </button>
        </div>
      )}
      <h1 className="mb-8 text-center text-2xl italic font-medium tracking-tight text-neutral-900">
        Build proof through practical projects
      </h1>
      <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
        {mockProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      <WelcomeToDo
        nextPath="/welcome/participant/project-detail"
        onBeforeNavigate={handleBeforeNavigate}
      />
    </div>
  );
}
