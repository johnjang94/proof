"use client";

import WelcomeToDo from "@/components/welcome/welcome-todo";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRequireSession } from "@/lib/auth/useRequireSession";

type Participant = {
  id: string;
  name: string;
  photo: string;
};

const mockParticipants: Participant[] = [
  {
    id: "1",
    name: "Ming-Na",
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face",
  },
  {
    id: "2",
    name: "Rebecca",
    photo:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop&crop=face",
  },
  {
    id: "3",
    name: "Christopher",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
  },
  {
    id: "4",
    name: "Sean",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
  },
  {
    id: "5",
    name: "Victoria",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face",
  },
  {
    id: "6",
    name: "Teresa",
    photo:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=300&fit=crop&crop=face",
  },
  {
    id: "7",
    name: "Raina",
    photo:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=300&fit=crop&crop=face",
  },
];

export default function ZoomCall() {
  const ok = useRequireSession("/login?role=participant");
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
        "mx-auto max-w-4xl px-4 pb-20 my-5",
        fadeIn && !fadingOut ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <div className="mb-6 flex justify-center">
        <div className="rounded-xl border border-neutral-200 bg-white px-6 py-2.5 text-sm text-neutral-700 shadow-sm">
          ...and you will be working with a group of other professionals who
          carry different jobs
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl bg-neutral-900 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-[8px]">✓</span>
              </div>
              <span className="text-xs text-neutral-300">
                Original Sound: Off ▾
              </span>
            </div>
          </div>
          <button className="flex items-center gap-1.5 rounded border border-neutral-600 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-700">
            ⊞ View
          </button>
        </div>
        <div className="px-3 pb-3">
          <div className="grid grid-cols-4 gap-1 mb-1">
            {mockParticipants.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="relative aspect-video overflow-hidden rounded bg-neutral-800"
              >
                <Image
                  src={p.photo}
                  alt={p.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <span className="absolute bottom-1 left-1 text-xs text-white bg-black/40 px-1 rounded">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1 mx-auto max-w-[75%]">
            {mockParticipants.slice(4).map((p) => (
              <div
                key={p.id}
                className="relative aspect-video overflow-hidden rounded bg-neutral-800"
              >
                <Image
                  src={p.photo}
                  alt={p.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <span className="absolute bottom-1 left-1 text-xs text-white bg-black/40 px-1 rounded">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-neutral-700 px-6 py-3">
          <div className="flex items-center gap-5">
            <button className="flex flex-col items-center gap-1 text-white hover:text-neutral-300">
              <span className="text-xl">🎤</span>
              <span className="text-[10px]">Mute</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-white hover:text-neutral-300">
              <span className="text-xl">📹</span>
              <span className="text-[10px]">Stop Video</span>
            </button>
          </div>
          <div className="flex items-center gap-5">
            <button className="flex flex-col items-center gap-1 text-white hover:text-neutral-300">
              <span className="text-xl">🛡️</span>
              <span className="text-[10px]">Security</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-white hover:text-neutral-300">
              <span className="text-xl">👥</span>
              <span className="text-[10px]">Participants</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-white hover:text-neutral-300">
              <span className="text-xl">💬</span>
              <span className="text-[10px]">Chat</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-green-400 hover:text-green-300">
              <span className="text-xl">📤</span>
              <span className="text-[10px]">Share Screen</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-white hover:text-neutral-300">
              <span className="text-xl">📊</span>
              <span className="text-[10px]">Polling</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-white hover:text-neutral-300">
              <span className="text-xl">⏺️</span>
              <span className="text-[10px]">Record</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-white hover:text-neutral-300">
              <span className="text-xl">⊞</span>
              <span className="text-[10px]">Breakout Rooms</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-white hover:text-neutral-300">
              <span className="text-xl">😊</span>
              <span className="text-[10px]">Reactions</span>
            </button>
          </div>
          <button className="rounded bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700">
            End
          </button>
        </div>
      </div>
      <WelcomeToDo
        nextPath="/welcome/participant/jobs"
        onBeforeNavigate={handleBeforeNavigate}
      />
    </div>
  );
}
