"use client";

import { supabase } from "@/lib/supabaseInstance";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useForm, useWatch } from "react-hook-form";
import Image from "next/image";
import { uploadAsset } from "@/services/upload/uploadAsset";

type FormValues = {
  username: string;
  email: string;
  password: string;
  retypePassword: string;
  firstName: string;
  lastName: string;
  avatar: FileList | null;
};

export default function Client() {
  const router = useRouter();

  const [authError, setAuthError] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [avatarName, setAvatarName] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [fadingOut, setFadingOut] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const usernamePattern = useMemo(() => /^[A-Za-z]+$/, []);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    setError,
    clearErrors,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      retypePassword: "",
      firstName: "",
      lastName: "",
      avatar: null,
    },
  });

  const passwordValue = useWatch({ control, name: "password" });

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const avatarRegister = register("avatar", {
    validate: (files) => {
      const file = files?.item?.(0);
      if (!file) return true;
      if (!file.type.startsWith("image/")) return "Only image files allowed";
      if (file.size > 5 * 1024 * 1024) return "Max 5MB";
      return true;
    },
  });

  const setAvatarFromFile = async (file: File) => {
    const dt = new DataTransfer();
    dt.items.add(file);
    setValue("avatar", dt.files, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    await trigger("avatar");
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setAvatarName(file.name);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    await setAvatarFromFile(file);
  };

  const onBrowsePick: React.ChangeEventHandler<HTMLInputElement> = async (
    e,
  ) => {
    avatarRegister.onChange(e);
    const file = e.target.files?.[0];
    if (!file) return;
    await setAvatarFromFile(file);
  };

  const checkUsernameTaken = async (username: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return !!data;
  };

  const onSubmit = async (values: FormValues) => {
    setAuthError(null);
    clearErrors("username");

    const username = values.username.trim().toLowerCase();
    const email = values.email.trim();
    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();

    setCheckingUsername(true);

    try {
      const taken = await checkUsernameTaken(username);
      if (taken) {
        setError("username", {
          type: "manual",
          message: "This username is already taken",
        });
        return;
      }

      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password: values.password,
          options: {
            data: {
              username,
              first_name: firstName,
              last_name: lastName,
              role: "client",
            },
          },
        });

      if (signUpError) {
        setAuthError(signUpError.message);
        return;
      }

      const user = signUpData.user;
      if (!user) {
        setAuthError("Sign up succeeded but user was not returned.");
        return;
      }

      const avatarFile = values.avatar?.item?.(0) ?? null;
      const avatarUrl = avatarFile
        ? await uploadAsset(avatarFile, "profile-avatar")
        : null;

      sessionStorage.setItem(
        "signup_partial",
        JSON.stringify({
          userId: user.id,
          username,
          firstName,
          lastName,
          avatarUrl,
        }),
      );

      setFadingOut(true);
      setTimeout(() => {
        router.push("/sign-up/company-info");
      }, 2000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setAuthError(message);
    } finally {
      setCheckingUsername(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#f7f7f7] px-6 py-10 transition-opacity duration-2000"
      style={{ opacity: fadingOut ? 0 : 1 }}
    >
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Create Client Account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Set up your profile to get started. You&apos;ll add company details
            next.
          </p>
          {/* Step indicator */}
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1.5 w-16 rounded-full bg-black" />
            <div className="h-1.5 w-16 rounded-full bg-gray-200" />
            <span className="ml-2 text-xs text-gray-400">Step 1 of 2</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                First Name
              </label>
              <input
                type="text"
                autoComplete="given-name"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                placeholder="Enter first name"
                {...register("firstName", {
                  required: "First name is required",
                  validate: (value) => {
                    if (!value.trim()) return "First name is required";
                    return true;
                  },
                })}
              />
              {errors.firstName && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Last Name
              </label>
              <input
                type="text"
                autoComplete="family-name"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                placeholder="Enter last name"
                {...register("lastName", {
                  required: "Last name is required",
                  validate: (value) => {
                    if (!value.trim()) return "Last name is required";
                    return true;
                  },
                })}
              />
              {errors.lastName && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
              placeholder="Enter username"
              {...register("username", {
                required: "Username is required",
                validate: (value) => {
                  const trimmed = value.trim();
                  if (!trimmed) return "Username is required";
                  if (!usernamePattern.test(trimmed))
                    return "Username must contain letters only";
                  if (trimmed.length < 2) return "Minimum 2 characters";
                  if (trimmed.length > 30) return "Maximum 30 characters";
                  return true;
                },
              })}
            />
            {errors.username && (
              <p className="mt-2 text-sm text-red-600">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
              placeholder="Enter email"
              {...register("email", {
                required: "Email is required",
                validate: (value) => {
                  if (!value.trim()) return "Email is required";
                  return true;
                },
              })}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
              placeholder="Enter password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Minimum 8 characters" },
                onChange: async () => {
                  await trigger("retypePassword");
                },
              })}
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Retype Password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
              placeholder="Retype password"
              {...register("retypePassword", {
                required: "Please retype your password",
                validate: (value) =>
                  value === passwordValue || "Passwords do not match",
              })}
            />
            {errors.retypePassword && (
              <p className="mt-2 text-sm text-red-600">
                {errors.retypePassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Profile Image
            </label>
            <input
              ref={(el) => {
                avatarRegister.ref(el);
                fileInputRef.current = el;
              }}
              type="file"
              accept="image/*"
              className="hidden"
              name={avatarRegister.name}
              onBlur={avatarRegister.onBlur}
              onChange={onBrowsePick}
            />
            <div
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
              className={`rounded-2xl border-2 border-dashed px-5 py-6 text-center transition ${
                dragActive
                  ? "border-black bg-gray-50"
                  : "border-gray-300 bg-white"
              }`}
            >
              {avatarPreview ? (
                <div className="flex flex-col items-center gap-3">
                  <Image
                    src={avatarPreview}
                    alt="Avatar preview"
                    width={96}
                    height={96}
                    className="rounded-full object-cover"
                  />
                  <p className="text-sm text-gray-700">{avatarName}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-800">
                    Drag and drop an image here
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                </div>
              )}
              <button
                type="button"
                className="mt-4 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse file
              </button>
            </div>
            {errors.avatar && (
              <p className="mt-2 text-sm text-red-600">
                {errors.avatar.message}
              </p>
            )}
          </div>

          {authError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid || isSubmitting || checkingUsername || fadingOut}
            className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer"
          >
            {isSubmitting || checkingUsername
              ? "Verifying..."
              : fadingOut
                ? "Moving to next step..."
                : "Next →"}
          </button>
        </form>
      </div>
    </div>
  );
}
