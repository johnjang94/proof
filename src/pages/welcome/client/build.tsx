"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useRequireSession } from "@/lib/auth/useRequireSession";

type Status = "confirmed" | "interviewing";

type Card = {
  title: string;
  skills: string;
  status: Status;
  person?: { name: string; note?: string; avatarUrl?: string };
  shortlistCount?: number;
};

export default function Build() {
  const router = useRouter();

  const ok = useRequireSession("/login?role=client");
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const navTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!ok) return;

    const t = window.setTimeout(() => setVisible(true), 50);
    return () => window.clearTimeout(t);
  }, [ok]);

  useEffect(() => {
    return () => {
      if (navTimerRef.current) window.clearTimeout(navTimerRef.current);
    };
  }, []);

  const navigateWithFade = (path: string) => {
    if (leaving) return;
    setLeaving(true);

    navTimerRef.current = window.setTimeout(() => {
      router.push(path);
    }, 450);
  };

  const cards: Card[] = [
    {
      title: "Front-end Developer",
      skills: "React  TypeScript  Tailwind CSS",
      status: "confirmed",
      person: {
        name: "Megan Roussey",
        note: "Selected",
        avatarUrl:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=60",
      },
    },
    {
      title: "Back-end Developer",
      skills: "Node.js  Postgre SQL  REST APIs",
      status: "interviewing",
      shortlistCount: 8,
    },
    {
      title: "UX Designer",
      skills: "Figma  User Research  Prototyping",
      status: "confirmed",
      person: {
        name: "Emily Comeau",
        note: "Selected",
        avatarUrl:
          "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=100&q=60",
      },
    },
    {
      title: "Project Manager",
      skills: "Stakeholder Management  Jira",
      status: "confirmed",
      person: {
        name: "Azakia Dakamoto",
        note: "Selected",
        avatarUrl:
          "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=100&q=60",
      },
    },
  ];

  const qaCard: Card = {
    title: "QA Engineer",
    skills: "Test Automation  Selenium  CI / CD",
    status: "interviewing",
    shortlistCount: 8,
  };

  if (!ok) return null;

  return (
    <div
      className={[
        "relative min-h-[85vh] transition-opacity duration-500 ease-in-out",
        visible && !leaving ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <div className="absolute left-1/2 top-6 -translate-x-1/2">
        <div className="rounded-full border border-gray-300 bg-white px-6 py-2 text-sm text-neutral-900 shadow-sm">
          We will help you build the team for your project
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-10 pt-28">
        <div className="relative">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={leaving}
            className={[
              "absolute left-0 top-1/2 -translate-y-1/2 rounded-md p-2 text-neutral-800 transition",
              leaving
                ? "cursor-not-allowed opacity-60"
                : "hover:bg-neutral-100",
            ].join(" ")}
            aria-label="Go back"
          >
            <span className="text-2xl leading-none">←</span>
          </button>

          <div className="text-center">
            <h1 className="text-4xl font-semibold tracking-tight">
              Let’s build your team
            </h1>
            <p className="mt-3 text-lg text-neutral-700">
              Your coordinator is assembling the right team for your project,{" "}
              <span className="text-neutral-900">Mobile App Redesign</span>
            </p>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {cards.map((c) => (
            <RoleCard key={c.title} card={c} />
          ))}

          <div className="md:col-span-2">
            <RoleCard card={qaCard} />
          </div>
        </div>

        <div className="text-center my-10">
          <button
            className={[
              "w-4/6 py-1 rounded-xl text-white transition",
              leaving
                ? "bg-blue-300/60 cursor-not-allowed"
                : "bg-blue-300 hover:bg-blue-700 hover:cursor-pointer",
            ].join(" ")}
            onClick={() => navigateWithFade("/welcome/client/dashboard")}
            disabled={leaving}
          >
            {leaving ? "Moving..." : "Next"}
          </button>
        </div>

        <div className="pb-16" />
      </main>
    </div>
  );
}

function RoleCard({ card }: { card: Card }) {
  return (
    <div className="rounded-md border border-neutral-300 bg-white shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-medium text-neutral-900">
              {card.title}
            </h2>
            <p className="mt-1 text-sm text-neutral-700">{card.skills}</p>

            <div className="mt-3">
              <StatusPill status={card.status} />
            </div>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-neutral-200" />

      <div className="p-4">
        {card.person ? (
          <div className="flex items-center gap-3">
            <Avatar name={card.person.name} url={card.person.avatarUrl} />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-neutral-900">
                {card.person.name}
              </div>
              <div className="text-xs text-neutral-500">
                {card.person.note ?? "Selected"}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-neutral-900">
            {card.shortlistCount ?? 0} candidates shortlisted
          </div>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Status }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        <span
          className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-emerald-400"
          aria-hidden="true"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6 9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        Confirmed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
      interviewing
    </span>
  );
}

function Avatar({ name, url }: { name: string; url?: string }) {
  const initial = (name?.trim()?.[0] ?? "U").toUpperCase();

  if (!url) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-sm font-medium text-neutral-700">
        {initial}
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={name}
      width={36}
      height={36}
      className="h-9 w-9 rounded-full object-cover"
    />
  );
}
