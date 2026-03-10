"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

type Props = {
  nextPath: string;
  onBeforeNavigate?: () => Promise<void>;
};

export default function WelcomeToDo({ nextPath, onBeforeNavigate }: Props) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const navTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = navTimerRef.current;
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const goNext = async () => {
    if (leaving) return;
    setLeaving(true);

    if (onBeforeNavigate) await onBeforeNavigate();

    navTimerRef.current = window.setTimeout(() => {
      router.push(nextPath);
    }, 450);
  };

  return (
    <div className="text-center my-10">
      <button
        className={[
          "w-4/6 py-1 rounded-xl text-white transition",
          leaving
            ? "bg-blue-300/60 cursor-not-allowed"
            : "bg-blue-300 hover:bg-blue-700 hover:cursor-pointer",
        ].join(" ")}
        onClick={goNext}
        disabled={leaving}
      >
        {leaving ? "Moving..." : "Next"}
      </button>
    </div>
  );
}
