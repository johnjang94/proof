import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { supabase } from "@/lib/supabaseInstance";
import useLoginForm from "@/hooks/useLoginForm";

async function waitForSupabaseSession(timeoutMs = 3000) {
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
      }
    });
  });
}

export default function MobileLogin({
  onLoginSuccess,
}: {
  onLoginSuccess?: () => void | Promise<void>;
}) {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    handleSubmit,
    errors,
    canLogin,
    passwordOk,
    isSubmitting,
    emailRegister,
    passwordRegister,
  } = useLoginForm();

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
    <main className="flex min-h-screen flex-col bg-zinc-300">
      <div className="flex h-60 items-center justify-center">
        <Link href="/">
          <Image src="/logo+slogan.png" alt="logo" width={2000} height={2000} />
        </Link>
      </div>

      <section className="flex-1 rounded-t-2xl bg-white px-2 pt-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-5">
          <div>
            <label className="mb-2 block text-xl font-medium">
              Email address
            </label>
            <input
              {...emailRegister}
              className="h-12 w-full rounded-lg border border-zinc-800/60 px-3 text-lg outline-none"
            />
            {errors.email?.message ? (
              <p className="mt-2 text-sm text-red-600">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-xl font-medium">Password</label>
            <input
              type="password"
              {...passwordRegister}
              className="h-12 w-full rounded-lg border border-zinc-800/60 px-3 text-lg outline-none"
            />
            {errors.password?.message ? (
              <p className="mt-2 text-sm text-red-600">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          {authError ? (
            <p className="text-sm text-red-600">{authError}</p>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={!canLogin || isSubmitting}
            className={[
              "h-12 w-full rounded-lg text-xl font-medium transition-colors",
              passwordOk && !isSubmitting
                ? "bg-cyan-600 text-white hover:cursor-pointer"
                : "cursor-not-allowed bg-zinc-200 text-zinc-600",
            ].join(" ")}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          <button type="button" className="text-left text-lg text-blue-600">
            Forgot your password?
          </button>

          <button
            type="button"
            onClick={() => router.push("/sign-up/participant")}
            className="mt-20 h-12 w-full rounded-lg bg-blue-600 text-xl font-medium text-white"
          >
            Become a participant
          </button>
        </form>
      </section>
    </main>
  );
}
