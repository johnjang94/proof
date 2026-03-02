import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { supabase } from "@/lib/supabaseInstance";
import useLoginForm from "@/hooks/useLoginForm";

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

    const redirectToRaw = router.query.redirectTo;
    const redirectTo =
      typeof redirectToRaw === "string" && redirectToRaw.startsWith("/")
        ? redirectToRaw
        : null;

    if (redirectTo) {
      router.replace(redirectTo);
      return;
    }

    if (onLoginSuccess) {
      await onLoginSuccess();
      return;
    }

    router.replace("/");
  };

  return (
    <main className="min-h-screen bg-zinc-300 flex flex-col">
      <div className="h-60 flex items-center justify-center">
        <Link href="/">
          <Image
            src="/logo+slogan_white.png"
            alt="logo"
            width={2000}
            height={2000}
          />
        </Link>
      </div>

      <section className="flex-1 bg-white rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-2 pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-5">
          <div>
            <label className="block text-xl font-medium mb-2">
              Email address
            </label>
            <input
              {...emailRegister}
              className="w-full h-12 rounded-lg border border-zinc-800/60 px-3 text-lg outline-none"
            />
            {errors.email?.message ? (
              <p className="mt-2 text-sm text-red-600">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-xl font-medium mb-2">Password</label>
            <input
              type="password"
              {...passwordRegister}
              className="w-full h-12 rounded-lg border border-zinc-800/60 px-3 text-lg outline-none"
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
            disabled={!canLogin}
            className={[
              "w-full h-12 rounded-lg text-xl font-medium transition-colors",
              passwordOk
                ? "bg-cyan-600 text-white hover:cursor-pointer"
                : "bg-zinc-200 text-zinc-600 cursor-not-allowed",
            ].join(" ")}
          >
            Login
          </button>

          <button type="button" className="text-left text-lg text-blue-600">
            Forgot your password?
          </button>

          <button
            type="button"
            onClick={() => router.push("/sign-up/participant")}
            className="w-full h-12 mt-20 rounded-lg bg-blue-600 text-xl text-white font-medium"
          >
            Become a participant
          </button>
        </form>
      </section>
    </main>
  );
}
