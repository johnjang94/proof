"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseInstance";

export function useRequireSession(redirectTo = "/login") {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      const { data } = await supabase.auth.getSession();
      if (!alive) return;

      if (!data.session) {
        router.replace(redirectTo);
        return;
      }
      setReady(true);
    };

    run();
    return () => {
      alive = false;
    };
  }, [router, redirectTo]);

  return ready;
}
