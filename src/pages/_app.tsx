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

type AuthUser = {
  id: string;
  email?: string;
} | null;

function AuthHeader() {
  return (
    <div className="sticky top-0 z-50 border-b bg-white">
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

function PageShell() {
  return <div className="min-h-[60vh]" />;
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const pathname = router.pathname ?? "/";
  const asPath = router.asPath ?? "/";

  const authRoutes = ["/sign-up", "/welcome"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isLoginRoute = pathname === "/login";
  const hideNav = isLoginRoute || isAuthRoute;

  const isClientRoute =
    pathname.startsWith("/main/client") ||
    pathname.startsWith("/client") ||
    pathname.startsWith("/project/client") ||
    pathname.startsWith("/category/profile/client") ||
    pathname.startsWith("/notification/client") ||
    pathname.startsWith("/notification/client") ||
    pathname.startsWith("/chat/client");

  const variant: "participant" | "client" = isClientRoute
    ? "client"
    : "participant";

  const [role, setRole] = useState<DbRole | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser>(null);
  const [authResolved, setAuthResolved] = useState(false);

  const roleHome = useMemo<Record<DbRole, string>>(
    () => ({
      participant: "/main/participant/landing",
      client: "/main/client/landing",
      hr: "/hr",
      admin: "/admin",
    }),
    [],
  );

  const guestAllowedRoutes = [
    "/",
    "/login",
    "/sign-up",
    "/welcome",
    "/welcome/participant",
    "/category/shopping",
    "/category/jobs",
    "/category/chat",
    "/main/participant/project",
    "/projects/public",
    "/project",
    "/main/participant/recruitment",
    "/main/participant/project-detail",
    "/main/participant/job-description",
  ];

  const guestAllowed = guestAllowedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  useEffect(() => {
    let alive = true;

    const syncFromSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!alive) return;

      if (!session) {
        setAuthUser(null);
        setRole(null);
        setAuthResolved(true);
        return;
      }

      setAuthUser({
        id: session.user.id,
        email: session.user.email ?? undefined,
      });

      const dbRole = await getMyRole();

      if (!alive) return;

      setRole(dbRole ?? null);
      setAuthResolved(true);
    };

    void syncFromSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!alive) return;

      if (event === "SIGNED_OUT" || !session) {
        setAuthUser(null);
        setRole(null);
        setAuthResolved(true);
        return;
      }

      setAuthUser({
        id: session.user.id,
        email: session.user.email ?? undefined,
      });

      if (
        event === "SIGNED_IN" ||
        event === "INITIAL_SESSION" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        const dbRole = await getMyRole();

        if (!alive) return;

        setRole(dbRole ?? null);
        setAuthResolved(true);
      }
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    if (!authResolved) return;
    if (isAuthRoute) return;

    if (role === null) {
      if (guestAllowed) return;
      const next = encodeURIComponent(asPath);
      void router.replace(`/login?redirectTo=${next}`);
      return;
    }

    if (pathname === "/") {
      if (router.asPath !== roleHome[role]) {
        void router.replace(roleHome[role]);
      }
      return;
    }

    if (role === "client" && !isClientRoute) {
      if (router.asPath !== roleHome.client) {
        void router.replace(roleHome.client);
      }
      return;
    }

    if (role === "participant" && isClientRoute) {
      if (router.asPath !== roleHome.participant) {
        void router.replace(roleHome.participant);
      }
    }
  }, [
    asPath,
    authResolved,
    guestAllowed,
    isAuthRoute,
    isClientRoute,
    pathname,
    role,
    roleHome,
    router,
  ]);

  const shouldBlockPage = !authResolved && !guestAllowed;

  return (
    <>
      {!hideNav && <TopNav variant={variant} authUser={authUser} />}

      {isAuthRoute && <AuthHeader />}

      {!hideNav && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white lg:hidden">
          <MobileNav authUser={authUser} />
        </div>
      )}

      <main className="pb-5 lg:px-5 lg:pb-0">
        {shouldBlockPage ? (
          <PageShell />
        ) : (
          <Component {...pageProps} authUser={authUser} role={role} />
        )}
      </main>
    </>
  );
}
