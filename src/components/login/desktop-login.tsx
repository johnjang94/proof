import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import type { Role } from "@/pages/category/login";
import { supabase } from "@/lib/supabaseClient";
import useLoginForm from "@/hooks/useLoginForm";

export default function DesktopLogin({
  role,
  setRole,
  RoleTabs,
}: {
  role: Role;
  setRole: (role: Role) => void;
  RoleTabs: React.ComponentType<{
    role: Role;
    setRole: (role: Role) => void;
    className?: string;
  }>;
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

    const redirectToRaw = router.query.redirectTo;
    const redirectTo =
      typeof redirectToRaw === "string" && redirectToRaw.startsWith("/")
        ? redirectToRaw
        : "/";

    router.replace(redirectTo);
  };

  return (
    <div className="mx-auto flex my-20">
      <section className="w-1/2 items-center justify-center flex">
        <Link href="/">
          <Image
            src="/logo+slogan_white.png"
            alt="logo"
            width={2000}
            height={2000}
          />
        </Link>
      </section>

      <section className="w-1/2 items-center justify-center flex">
        <div className="w-full max-w-md px-6">
          <RoleTabs role={role} setRole={setRole} className="mb-10" />

          <form onSubmit={handleSubmit(onSubmit)}>
            <label className="mb-2 block text-sm">Email address</label>
            <input
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
                  : "bg-gray-200 text-gray-600 cursor-not-allowed",
              ].join(" ")}
            >
              Login
            </button>

            <a className="text-sm text-blue-600" href="#">
              Forgot your password?
            </a>

            <div className="mt-20">
              <Link
                href={
                  role === "participant"
                    ? "/category/sign-up/participant"
                    : "/category/sign-up/client"
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
