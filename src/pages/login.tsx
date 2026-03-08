import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

import RoleTabs from "@/components/login/RoleTabs";
import DesktopLogin from "@/components/login/desktop-login";
import MobileLogin from "@/components/login/mobile-login";
import { getMyRole, type Role as DbRole } from "@/lib/auth/getMyRole";
import { supabase } from "@/lib/supabaseInstance";

export type Role = "participant" | "client";

const LOGIN_ROLE_STORAGE_KEY = "proof-login-role";

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("participant");
  const [roleHydrated, setRoleHydrated] = useState(false);

  const roleHome = useMemo<Record<DbRole, string>>(
    () => ({
      participant: "/main/participant/landing",
      client: "/main/client/landing",
      hr: "/hr",
      admin: "/admin",
    }),
    [],
  );

  const redirectByRole = async () => {
    const dbRole = await getMyRole();
    if (!dbRole) return;
    router.replace(roleHome[dbRole]);
  };

  useEffect(() => {
    const savedRole = sessionStorage.getItem(LOGIN_ROLE_STORAGE_KEY);

    if (savedRole === "participant" || savedRole === "client") {
      setRole(savedRole);
    }

    setRoleHydrated(true);
  }, []);

  useEffect(() => {
    if (!roleHydrated) return;
    sessionStorage.setItem(LOGIN_ROLE_STORAGE_KEY, role);
  }, [role, roleHydrated]);

  useEffect(() => {
    if (!router.isReady) return;

    const from = router.query.from;
    if (from === "signup") return;

    let alive = true;

    const run = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!alive) return;
      if (!session) return;

      await redirectByRole();
    };

    run();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.from]);

  const handleSetRole = (nextRole: Role) => {
    setRole(nextRole);
  };

  if (!roleHydrated) {
    return <main className="min-h-[60vh]" />;
  }

  return (
    <main>
      <div className="hidden md:block">
        <DesktopLogin
          role={role}
          setRole={handleSetRole}
          RoleTabs={RoleTabs}
          onLoginSuccess={redirectByRole}
        />
      </div>

      <div className="md:hidden">
        <MobileLogin onLoginSuccess={redirectByRole} />
      </div>
    </main>
  );
}
