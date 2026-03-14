"use client";

import WelcomeToDo from "@/components/welcome/welcome-todo";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useRequireSession } from "@/lib/auth/useRequireSession";
import { supabase } from "@/lib/supabaseInstance";

export default function Ready() {
  const ok = useRequireSession("/login?role=participant");
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ok) return;
    const t = window.setTimeout(() => setVisible(true), 50);
    return () => window.clearTimeout(t);
  }, [ok]);

  if (!ok) return null;

  const redirectToRaw = router.query.redirectTo;
  const redirectTo =
    typeof redirectToRaw === "string" && redirectToRaw.startsWith("/")
      ? redirectToRaw
      : null;

  const nextPath = redirectTo
    ? `/login?role=participant&from=signup&redirectTo=${encodeURIComponent(redirectTo)}`
    : "/login?role=participant&from=signup";

  return (
    <div
      className={[
        "my-40 text-center space-y-20 transition-opacity duration-500 ease-in-out px-96",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <h1 className="text-3xl">Now, are you ready to have some fun with us?</h1>
      <WelcomeToDo
        nextPath={nextPath}
        onBeforeNavigate={async () => {
          await supabase.auth.signOut();
        }}
      />
    </div>
  );
}
