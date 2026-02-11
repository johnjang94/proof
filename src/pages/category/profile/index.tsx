import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function Profile() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const onBack = () => router.replace("/");

  const onLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.replace("/category/login");
  };

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex w-full max-w-6xl gap-8 px-6 py-10">
        <aside className="w-72 shrink-0">
          <div className="rounded-2xl border bg-white p-5">
            <div className="text-sm text-zinc-500">Account</div>
            <div className="mt-1 text-lg font-semibold">Profile</div>

            <nav className="mt-6 space-y-2">
              <button className="w-full rounded-xl px-4 py-3 text-left text-sm hover:bg-zinc-50 hover:cursor-pointer">
                Profile
              </button>
              <button className="w-full rounded-xl px-4 py-3 text-left text-sm hover:bg-zinc-50 hover:cursor-pointer">
                Billing
              </button>
              <button className="w-full rounded-xl px-4 py-3 text-left text-sm hover:bg-zinc-50 hover:cursor-pointer">
                Classes & Certificates
              </button>
              <button className="w-full rounded-xl px-4 py-3 text-left text-sm hover:bg-zinc-50 hover:cursor-pointer">
                Careers
              </button>
            </nav>

            <div className="mt-10 border-t pt-4 space-y-2">
              <button
                type="button"
                onClick={onBack}
                className="w-full rounded-xl px-4 py-3 text-left text-sm hover:bg-zinc-50 hover:cursor-pointer"
              >
                Back
              </button>

              <button
                type="button"
                onClick={onLogout}
                disabled={loggingOut}
                className="w-full rounded-xl px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 hover:cursor-pointer"
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </aside>

        <section className="flex-1">
          <div className="rounded-2xl border bg-white p-8">
            <h1 className="text-2xl font-semibold">Personal Information</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Update your personal details and profile information
            </p>

            <div className="mt-8 h-40 rounded-xl bg-zinc-50" />
          </div>
        </section>
      </div>
    </main>
  );
}
