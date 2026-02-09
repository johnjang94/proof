import { useState } from "react";

import RoleTabs from "@/components/login/RoleTabs";
import DesktopLogin from "@/components/login/desktop-login";
import MobileLogin from "@/components/login/mobile-login";

export type Role = "participant" | "client";

export default function Login() {
  const [role, setRole] = useState<Role>("participant");

  return (
    <main>
      <div className="hidden md:block">
        <DesktopLogin role={role} setRole={setRole} RoleTabs={RoleTabs} />
      </div>

      <div className="md:hidden">
        <MobileLogin role={role} setRole={setRole} RoleTabs={RoleTabs} />
      </div>
    </main>
  );
}
