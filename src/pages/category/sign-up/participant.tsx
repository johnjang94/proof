import { useRouter } from "next/router";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

type FormValues = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  avatar: FileList;
};

export default function Participant() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const [dragActive, setDragActive] = useState(false);
  const [avatarName, setAvatarName] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const usernamePattern = useMemo(() => /^[A-Za-z]+$/, []);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({ mode: "onChange" });

  const avatarRegister = register("avatar", {
    validate: (files) => {
      const f = files?.item?.(0);
      if (!f) return true;
      if (!f.type.startsWith("image/")) return "Only image files allowed";
      if (f.size > 5 * 1024 * 1024) return "Max 5MB";
      return true;
    },
  });

  const setAvatarFromFile = async (file: File) => {
    const dt = new DataTransfer();
    dt.items.add(file);
    setValue("avatar", dt.files, { shouldValidate: true, shouldDirty: true });
    await trigger("avatar");

    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarName(file.name);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    await setAvatarFromFile(file);
  };

  const onBrowsePick: React.ChangeEventHandler<HTMLInputElement> = async (
    e,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await setAvatarFromFile(file);
  };

  const onSubmit = async (values: FormValues) => {
    setAuthError(null);

    const username = values.username.trim().toLowerCase();
    const email = values.email.trim();
    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password: values.password,
        options: {
          data: {
            username,
            first_name: firstName,
            last_name: lastName,
            role: "participant",
          },
        },
      },
    );

    if (signUpError) {
      setAuthError(signUpError.message);
      return;
    }

    if (!signUpData.session) {
      router.replace(
        `/category/auth/check-email?email=${encodeURIComponent(email)}`,
      );
      return;
    }

    router.replace("/category/welcome/introduction");
  };

  return (
    <main>
      <section className="mx-auto w-full max-w-xl px-6 py-8">
        <h1 className="text-4xl font-semibold text-center">
          Ready to Join us?
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-12 space-y-6"
          noValidate
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm">First name</label>
              <input
                className="w-full rounded-md border border-zinc-400 px-4 py-3 outline-none focus:border-black"
                placeholder="Ian"
                {...register("firstName", {
                  required: "First name is required",
                  minLength: { value: 2, message: "At least 2 characters" },
                  pattern: {
                    value: /^[A-Za-z]+$/,
                    message: "Only letters allowed",
                  },
                })}
              />
              {errors.firstName?.message && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm">Last name</label>
              <input
                className="w-full rounded-md border border-zinc-400 px-4 py-3 outline-none focus:border-black"
                placeholder="Cooper"
                {...register("lastName", {
                  required: "Last name is required",
                  minLength: { value: 2, message: "At least 2 characters" },
                  pattern: {
                    value: /^[A-Za-z]+$/,
                    message: "Only letters allowed",
                  },
                })}
              />
              {errors.lastName?.message && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm">Username</label>
            <input
              className="w-full rounded-md border border-zinc-400 px-4 py-3 outline-none focus:border-black"
              placeholder="i.e. thehandsomeketchup"
              autoComplete="username"
              {...register("username", {
                required: "Username is required",
                minLength: { value: 2, message: "At least 2 characters" },
                pattern: {
                  value: usernamePattern,
                  message: "Only letters allowed",
                },
                validate: async (value) => {
                  const v = value.trim().toLowerCase();
                  if (v.length < 2) return true;
                  if (!usernamePattern.test(v)) return true;

                  setCheckingUsername(true);
                  const { data, error } = await supabase
                    .from("profiles")
                    .select("id")
                    .eq("username", v)
                    .limit(1);
                  setCheckingUsername(false);

                  if (error) return "Could not verify username";
                  if (data && data.length > 0)
                    return "Username is already taken";
                  return true;
                },
              })}
            />
            {checkingUsername ? (
              <p className="mt-2 text-sm text-zinc-500">Checking username...</p>
            ) : errors.username?.message ? (
              <p className="mt-2 text-sm text-red-600">
                {errors.username.message}
              </p>
            ) : (
              <div />
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm">Email</label>
            <input
              className="w-full rounded-md border border-zinc-400 px-4 py-3 outline-none focus:border-black"
              placeholder="i.e. ianc@gmail.com"
              inputMode="email"
              autoComplete="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
              })}
            />
            {errors.email?.message && (
              <p className="mt-2 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm">Password</label>
            <input
              type="password"
              placeholder="******"
              className="w-full rounded-md border border-zinc-400 px-4 py-3 outline-none focus:border-black"
              autoComplete="new-password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "At least 6 characters" },
              })}
            />
            {errors.password?.message && (
              <p className="mt-2 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm">Profile photo</label>

            <input
              ref={(el) => {
                avatarRegister.ref(el);
                fileInputRef.current = el;
              }}
              name={avatarRegister.name}
              onBlur={avatarRegister.onBlur}
              onChange={(e) => {
                avatarRegister.onChange(e);
                onBrowsePick(e);
              }}
              type="file"
              accept="image/*"
              className="hidden"
            />

            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  fileInputRef.current?.click();
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(false);
              }}
              onDrop={onDrop}
              className={[
                "w-full rounded-2xl border p-10 text-center transition-colors",
                dragActive
                  ? "border-black bg-zinc-50"
                  : "border-zinc-300 bg-white",
                "cursor-pointer select-none",
              ].join(" ")}
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 16V4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M7 8L12 3L17 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 20H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="text-xl font-medium">
                Drag & Drop your photo here
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                or click here to browse
              </div>
              <div className="mt-2 text-sm text-zinc-500">
                supported file types: JPG, PNG, WEBP
              </div>

              {avatarName && (
                <div className="mt-6 flex items-center justify-center gap-4">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Selected avatar preview"
                      className="h-12 w-12 rounded-full object-cover"
                      width={100}
                      height={100}
                    />
                  ) : null}
                  <div className="text-sm text-zinc-700">{avatarName}</div>
                </div>
              )}
            </div>

            {errors.avatar?.message && (
              <p className="mt-2 text-sm text-red-600">
                {errors.avatar.message as string}
              </p>
            )}
          </div>

          {authError ? (
            <p className="text-sm text-red-600">{authError}</p>
          ) : (
            <div />
          )}

          <div className="pt-10 flex justify-end">
            <button
              type="submit"
              disabled={!isValid || isSubmitting || checkingUsername}
              className="rounded-md bg-black px-6 py-3 text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Loading..." : "Continue"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
