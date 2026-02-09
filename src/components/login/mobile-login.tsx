import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import type { Role } from "@/pages/category/login";
import { supabase } from "@/lib/supabaseClient";
import useLoginForm from "@/hooks/useLoginForm";

export default function MobileLogin({
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
  const router = useRouter();
  const {
    handleSubmit,
    errors,
    canLogin,
    passwordOk,
    emailRegister,
    passwordRegister,
  } = useLoginForm();

  const onSubmit = async (values: { email: string; password: string }) => {
    const { error } = await supabase.auth.signInWithPassword(values);
    if (!error) router.replace("/");
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
        <RoleTabs role={role} setRole={setRole} />

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
            className="w-full h-12 mt-20 rounded-lg bg-blue-600 text-xl text-white font-medium"
          >
            {role === "participant"
              ? "Become a participant"
              : "Become a client"}
          </button>
        </form>
      </section>
    </main>
  );
}
