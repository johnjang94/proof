import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import type { Role } from "@/pages/login";
import { supabase } from "@/lib/supabaseInstance";
import useLoginForm from "@/hooks/useLoginForm";

async function waitForSupabaseSession(timeoutMs = 3000) {
  const startedAt = Date.now();

  const {
    data: { session: initialSession },
  } = await supabase.auth.getSession();

  if (initialSession) return initialSession;

  return await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      subscription.unsubscribe();
      reject(new Error("Session was not established in time."));
    }, timeoutMs);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        clearTimeout(timer);
        subscription.unsubscribe();
        resolve(session);
      } else if (Date.now() - startedAt >= timeoutMs) {
        clearTimeout(timer);
        subscription.unsubscribe();
        reject(new Error("Session was not established in time."));
      }
    });
  });
}

export default function DesktopLogin({
  role,
  setRole,
  RoleTabs,
  onLoginSuccess,
}: {
  role: Role;
  setRole: (role: Role) => void;
  RoleTabs: React.ComponentType<{
    role: Role;
    setRole: (role: Role) => void;
    className?: string;
  }>;
  onLoginSuccess?: () => void | Promise<void>;
}) {
  const {
    handleSubmit,
    errors,
    isSubmitting,
    canLogin,
    emailRegister,
    passwordRegister,
  } = useLoginForm();

  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  const onSubmit = async (values: { email: string; password: string }) => {
    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      setAuthError(error.message);
      return;
    }

    try {
      await waitForSupabaseSession();
    } catch {
      setAuthError(
        "Login succeeded, but session sync was delayed. Please try again.",
      );
      return;
    }

    const redirectToRaw = router.query.redirectTo;
    const redirectTo =
      typeof redirectToRaw === "string" && redirectToRaw.startsWith("/")
        ? redirectToRaw
        : null;

    if (onLoginSuccess) {
      await onLoginSuccess();
      return;
    }

    await router.replace(redirectTo ?? "/");
  };

  return (
    <div className="mx-auto my-20 flex">
      <section className="flex w-1/2 items-center justify-center">
        <Link href="/">
          <Image
            src="/slogan.png"
            alt="Slogan"
            width={1200}
            height={400}
            unoptimized
            priority
          />
        </Link>
      </section>

      <section className="flex w-1/2 items-center justify-center">
        <div className="w-full max-w-md px-6">
          <RoleTabs role={role} setRole={setRole} className="mb-10" />

          <form onSubmit={handleSubmit(onSubmit)}>
            <label className="mb-2 block text-sm">Email address</label>
            <input
              type="email"
              autoComplete="email"
              {...emailRegister}
              className="mb-2 w-full rounded-md border px-4 py-3"
            />
            {errors.email?.message ? (
              <p className="mb-4 text-sm text-red-600">
                {errors.email.message}
              </p>
            ) : (
              <div className="mb-6" />
            )}

            <label className="mb-2 block text-sm">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              {...passwordRegister}
              className="mb-2 w-full rounded-md border px-4 py-3"
            />
            {errors.password?.message ? (
              <p className="mb-4 text-sm text-red-600">
                {errors.password.message}
              </p>
            ) : (
              <div className="mb-6" />
            )}

            {authError ? (
              <p className="mb-4 text-sm text-red-600">{authError}</p>
            ) : (
              <div className="mb-4" />
            )}

            <button
              type="submit"
              disabled={!canLogin || isSubmitting}
              className={[
                "mb-3 w-full rounded-md py-3 font-medium transition-colors",
                canLogin && !isSubmitting
                  ? "bg-cyan-600 text-white hover:cursor-pointer"
                  : "cursor-not-allowed bg-gray-200 text-gray-600",
              ].join(" ")}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            <a className="text-sm text-blue-600" href="#">
              Forgot your password?
            </a>

            <div className="mt-20">
              <Link
                href={
                  role === "participant"
                    ? "/sign-up/participant"
                    : "/sign-up/client"
                }
                className="block w-full rounded-md py-3 text-center font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                {role === "participant"
                  ? "Become a participant"
                  : "Become a client"}
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
