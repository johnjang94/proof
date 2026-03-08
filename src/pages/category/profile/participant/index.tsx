import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseInstance";
import { useMemo, useState } from "react";
import { FiChevronRight, FiLogOut, FiArrowLeft } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import { RiBillLine } from "react-icons/ri";
import { HiOutlineFolderOpen } from "react-icons/hi";
import { BsBriefcase } from "react-icons/bs";

type SectionKey = "profile" | "billing" | "projects" | "careers";

type MenuItem = {
  key: SectionKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const menuItems: MenuItem[] = [
  { key: "profile", label: "Profile", icon: CgProfile },
  { key: "billing", label: "Billing", icon: RiBillLine },
  { key: "projects", label: "Projects", icon: HiOutlineFolderOpen },
  { key: "careers", label: "Careers", icon: BsBriefcase },
];

export default function Profile() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>("profile");

  const onBack = () => router.replace("/");

  const onLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const sectionTitle = useMemo(() => {
    if (activeSection === "profile") return "Personal Information";
    if (activeSection === "billing") return "Billing";
    if (activeSection === "projects") return "Project History";
    return "Careers";
  }, [activeSection]);

  const sectionDescription = useMemo(() => {
    if (activeSection === "profile") {
      return "Update your personal details and profile information";
    }
    if (activeSection === "billing") {
      return "Manage payment methods, invoices, and subscription details";
    }
    if (activeSection === "projects") {
      return "Check your current and previous project activities";
    }
    return "Track your career direction, experience, and future opportunities";
  }, [activeSection]);

  return (
    <main className="min-h-screen bg-zinc-50 pb-24 lg:pb-10">
      <div className="mx-auto w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-6 lg:py-10">
        <div className="space-y-4 lg:hidden">
          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
                  My Account
                </h1>
                <p className="mt-2 text-sm text-zinc-500">
                  Manage your account, profile, and activity
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
                <CgProfile className="text-2xl text-zinc-700" />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-3 shadow-sm">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveSection(item.key)}
                    className={[
                      "flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition",
                      active
                        ? "border-black bg-black text-white"
                        : "border-zinc-200 bg-white text-zinc-700",
                    ].join(" ")}
                  >
                    <Icon className="text-lg" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
              {sectionTitle}
            </h2>
            <p className="mt-2 text-base text-zinc-500">{sectionDescription}</p>

            <div className="mt-6 rounded-2xl bg-zinc-100 p-4">
              {activeSection === "profile" && (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-white p-4">
                    <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                      Full Name
                    </div>
                    <div className="mt-2 text-base font-medium text-zinc-900">
                      Add your name
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                      Email
                    </div>
                    <div className="mt-2 text-base font-medium text-zinc-900">
                      Add your email
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                      Bio
                    </div>
                    <div className="mt-2 text-base text-zinc-500">
                      Tell people a little about yourself
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "billing" && (
                <div className="rounded-2xl bg-white p-4 text-zinc-500">
                  Billing content goes here.
                </div>
              )}

              {activeSection === "projects" && (
                <div className="rounded-2xl bg-white p-4 text-zinc-500">
                  Project history will appear here.
                </div>
              )}

              {activeSection === "careers" && (
                <div className="rounded-2xl bg-white p-4 text-zinc-500">
                  Careers content goes here.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-3 shadow-sm">
            <button
              type="button"
              onClick={onBack}
              className="flex w-full items-center justify-between rounded-2xl px-3 py-4 text-left transition hover:bg-zinc-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100">
                  <FiArrowLeft className="text-lg text-zinc-700" />
                </div>
                <span className="text-base font-medium text-zinc-900">
                  Back
                </span>
              </div>
              <FiChevronRight className="text-zinc-400" />
            </button>

            <button
              type="button"
              onClick={onLogout}
              disabled={loggingOut}
              className="mt-2 flex w-full items-center justify-between rounded-2xl px-3 py-4 text-left transition hover:bg-red-50 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50">
                  <FiLogOut className="text-lg text-red-600" />
                </div>
                <span className="text-base font-medium text-red-600">
                  {loggingOut ? "Logging out..." : "Logout"}
                </span>
              </div>
              <FiChevronRight className="text-red-300" />
            </button>
          </section>
        </div>

        <div className="hidden gap-8 lg:flex">
          <aside className="w-72 shrink-0">
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const active = activeSection === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveSection(item.key)}
                      className={[
                        "w-full rounded-2xl px-4 py-3 text-left text-sm transition hover:cursor-pointer",
                        active
                          ? "bg-zinc-100 font-medium text-zinc-950"
                          : "text-zinc-700 hover:bg-zinc-50",
                      ].join(" ")}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-10 space-y-2 border-t pt-4">
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full rounded-2xl px-4 py-3 text-left text-sm text-zinc-700 transition hover:cursor-pointer hover:bg-zinc-50"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  disabled={loggingOut}
                  className="w-full rounded-2xl px-4 py-3 text-left text-sm text-red-600 transition hover:cursor-pointer hover:bg-red-50 disabled:opacity-50"
                >
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          </aside>

          <section className="flex-1">
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
              <h1 className="text-2xl font-semibold text-zinc-950">
                {sectionTitle}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">{sectionDescription}</p>

              <div className="mt-8 rounded-2xl bg-zinc-100 p-6">
                {activeSection === "profile" && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-white p-5">
                      <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                        Full Name
                      </div>
                      <div className="mt-2 text-base font-medium text-zinc-900">
                        Add your name
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white p-5">
                      <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                        Email
                      </div>
                      <div className="mt-2 text-base font-medium text-zinc-900">
                        Add your email
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white p-5 md:col-span-2">
                      <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                        Bio
                      </div>
                      <div className="mt-2 text-base text-zinc-500">
                        Tell people a little about yourself
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "billing" && (
                  <div className="rounded-2xl bg-white p-5 text-zinc-500">
                    Billing content goes here.
                  </div>
                )}

                {activeSection === "projects" && (
                  <div className="rounded-2xl bg-white p-5 text-zinc-500">
                    Project history will appear here.
                  </div>
                )}

                {activeSection === "careers" && (
                  <div className="rounded-2xl bg-white p-5 text-zinc-500">
                    Careers content goes here.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
