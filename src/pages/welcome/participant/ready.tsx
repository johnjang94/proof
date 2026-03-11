"use client";

import { useEffect, useState } from "react";
import { useRequireSession } from "@/lib/auth/useRequireSession";
import { supabase } from "@/lib/supabaseInstance";
import WelcomeToDo from "@/components/welcome/welcome-todo";

export default function Ready() {
  const ok = useRequireSession("/login?role=participant");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ok) return;
    const t = window.setTimeout(() => setVisible(true), 50);
    return () => window.clearTimeout(t);
  }, [ok]);

  if (!ok) return null;

  return (
    <div
      className={[
        "my-40 text-center space-y-20 transition-opacity duration-500 ease-in-out max-w-2xl mx-auto",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      <h1 className="text-3xl">Now, are you ready to have some fun with us?</h1>
      <WelcomeToDo
        nextPath="/login?role=participant&from=signup"
        onBeforeNavigate={async () => {
          await supabase.auth.signOut();
        }}
      />
    </div>
  );
}
