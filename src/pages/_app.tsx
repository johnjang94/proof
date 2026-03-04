import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import MobileNav from "@/components/nav/mobile-navigation";
import TopNav from "@/components/nav/navigation";
import { getMyRole, type Role as DbRole } from "@/lib/auth/getMyRole";
import { supabase } from "@/lib/supabaseInstance";

declare global {
  interface Window {
    supabase: typeof supabase;
  }
}

if (typeof window !== "undefined") {
  window.supabase = supabase;
}

function AuthHeader() {
  return (
    <div className="sticky top-0 bg-white border-b z-50">
      <div className="mx-auto flex items-center justify-center">
        <Link
          href="/"
          aria-label="Go to home"
          className="inline-flex items-center gap-2"
        >
          <Image
            src="/logo.png"
            alt="PROOF"
            width={50}
            height={50}
            className="py-5"
          />
        </Link>
      </div>
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const pathname = router.pathname ?? "/";

  const authRoutes = ["/sign-up", "/welcome"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isLoginRoute = pathname === "/login";
  const isHomeRoute = pathname === "/";
  const hideNav = isLoginRoute || isAuthRoute;

  const isClientRoute =
    pathname.startsWith("/main/client") ||
    pathname.startsWith("/client") ||
    pathname.startsWith("/project/client") ||
    pathname.startsWith("/category/profile/client");

  const variant = isClientRoute ? "client" : "participant";
  const [role, setRole] = useState<DbRole | null | undefined>(undefined);

  const roleHome = useMemo<Record<DbRole, string>>(
    () => ({
      participant: "/main/participant/landing",
      client: "/main/client/landing",
      hr: "/hr",
      admin: "/admin",
    }),
    [],
  );

  const guestAllowed = isHomeRoute || isLoginRoute || isAuthRoute;
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setRole(null);
      else setRole(undefined);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (role !== undefined) return;
    let cancelled = false;

    const run = async () => {
      const dbRole = await getMyRole();
      if (cancelled) return;
      setRole(dbRole ?? null);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [role]);

  useEffect(() => {
    if (!router.isReady) return;
    if (role === undefined) return;
    if (role === null) {
      if (guestAllowed) return;
      const next = encodeURIComponent(pathname);
      router.replace(`/login?redirectTo=${next}`);
      return;
    }

    if (pathname === "/") {
      router.replace(roleHome[role]);
      return;
    }

    if (role === "client" && !isClientRoute) {
      router.replace(roleHome.client);
      return;
    }

    if (role === "participant" && isClientRoute) {
      router.replace(roleHome.participant);
      return;
    }
  }, [router, pathname, role, roleHome, isClientRoute, guestAllowed]);

  const shouldBlockPage = role === undefined;

  return (
    <>
      {!hideNav && <TopNav variant={variant} />}

      {isAuthRoute && <AuthHeader />}

      {!hideNav && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white">
          <MobileNav />
        </div>
      )}

      <main className="pb-5 lg:pb-0 px-5">
        {shouldBlockPage ? null : <Component {...pageProps} />}
      </main>
    </>
  );
}
