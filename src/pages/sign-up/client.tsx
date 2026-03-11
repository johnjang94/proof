"use client";

import { supabase } from "@/lib/supabaseInstance";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useForm, useWatch } from "react-hook-form";
import Image from "next/image";
import { uploadAsset } from "@/services/upload/uploadAsset";
import { apiFetch } from "@/lib/apiFetch";

type FormValues = {
  username: string;
  email: string;
  password: string;
  retypePassword: string;
  firstName: string;
  lastName: string;
  companyName: string;
  avatar: FileList | null;
  companyLogo: FileList | null;
};

type ProfileBase = {
  username: string;
  first_name: string;
  last_name: string;
  company_name: string;
  role: "client";
  avatar_url: string | null;
};

const PROFILE_ID_COL: "id" | "user_id" = "id";

type ProfileById = { id: string } & ProfileBase;
type ProfileByUserId = { user_id: string } & ProfileBase;

export default function Client() {
  const router = useRouter();

  const [authError, setAuthError] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [avatarName, setAvatarName] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [companyLogoDragActive, setCompanyLogoDragActive] = useState(false);
  const [companyLogoName, setCompanyLogoName] = useState<string | null>(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(
    null,
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const companyLogoInputRef = useRef<HTMLInputElement | null>(null);
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
      companyName: "",
      avatar: null,
      companyLogo: null,
    },
  });

  const passwordValue = useWatch({ control, name: "password" });

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (companyLogoPreview) URL.revokeObjectURL(companyLogoPreview);
    };
  }, [avatarPreview, companyLogoPreview]);

  const avatarRegister = register("avatar", {
    validate: (files) => {
      const file = files?.item?.(0);
      if (!file) return true;
      if (!file.type.startsWith("image/")) return "Only image files allowed";
      if (file.size > 5 * 1024 * 1024) return "Max 5MB";
      return true;
    },
  });

  const companyLogoRegister = register("companyLogo", {
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

  const setCompanyLogoFromFile = async (file: File) => {
    const dt = new DataTransfer();
    dt.items.add(file);
    setValue("companyLogo", dt.files, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    await trigger("companyLogo");
    setCompanyLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setCompanyLogoName(file.name);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    await setAvatarFromFile(file);
  };

  const onCompanyLogoDrop: React.DragEventHandler<HTMLDivElement> = async (
    e,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setCompanyLogoDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    await setCompanyLogoFromFile(file);
  };

  const onBrowsePick: React.ChangeEventHandler<HTMLInputElement> = async (
    e,
  ) => {
    avatarRegister.onChange(e);
    const file = e.target.files?.[0];
    if (!file) return;
    await setAvatarFromFile(file);
  };

  const onCompanyLogoPick: React.ChangeEventHandler<HTMLInputElement> = async (
    e,
  ) => {
    companyLogoRegister.onChange(e);
    const file = e.target.files?.[0];
    if (!file) return;
    await setCompanyLogoFromFile(file);
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

  const upsertProfile = async (userId: string, base: ProfileBase) => {
    if (PROFILE_ID_COL === "id") {
      const payload: ProfileById = { id: userId, ...base };
      const { error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "id" });
      if (error) throw new Error(error.message);
      return;
    }
    const payload: ProfileByUserId = { user_id: userId, ...base };
    const { error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
  };

  const onSubmit = async (values: FormValues) => {
    setAuthError(null);
    clearErrors("username");

    const username = values.username.trim().toLowerCase();
    const email = values.email.trim();
    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();
    const companyName = values.companyName.trim();

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
              company_name: companyName,
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

      const companyLogoFile = values.companyLogo?.item?.(0) ?? null;
      const companyLogoUrl = companyLogoFile
        ? await uploadAsset(companyLogoFile, "company-logo")
        : null;

      await upsertProfile(user.id, {
        username,
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        role: "client",
        avatar_url: avatarUrl,
      });

      await apiFetch("/auth/sync", {
        method: "POST",
        body: JSON.stringify({
          firstName,
          lastName,
          companyName,
          avatarUrl,
          companyLogoUrl,
        }),
      });

      router.replace("/main/client/landing");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setAuthError(message);
    } finally {
      setCheckingUsername(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] px-6 py-10">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Create Client Account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Set up your client profile and start posting projects.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* 1. First Name */}
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

          {/* 2. Last Name */}
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

          {/* 3. Username */}
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

          {/* 4. Email */}
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

          {/* 5. Password */}
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

          {/* 6. Retype Password */}
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

          {/* 7. Profile Image */}
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
              className={`rounded-2xl border-2 border-dashed px-5 py-6 text-center transition ${dragActive ? "border-black bg-gray-50" : "border-gray-300 bg-white"}`}
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

          {/* 8. Company Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Company Name
            </label>
            <input
              type="text"
              autoComplete="organization"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
              placeholder="Enter company name"
              {...register("companyName", {
                required: "Company name is required",
                validate: (value) => {
                  if (!value.trim()) return "Company name is required";
                  return true;
                },
              })}
            />
            {errors.companyName && (
              <p className="mt-2 text-sm text-red-600">
                {errors.companyName.message}
              </p>
            )}
          </div>

          {/* 9. Company Logo */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Company Logo
            </label>
            <input
              ref={(el) => {
                companyLogoRegister.ref(el);
                companyLogoInputRef.current = el;
              }}
              type="file"
              accept="image/*"
              className="hidden"
              name={companyLogoRegister.name}
              onBlur={companyLogoRegister.onBlur}
              onChange={onCompanyLogoPick}
            />
            <div
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCompanyLogoDragActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCompanyLogoDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCompanyLogoDragActive(false);
              }}
              onDrop={onCompanyLogoDrop}
              className={`rounded-2xl border-2 border-dashed px-5 py-6 text-center transition ${companyLogoDragActive ? "border-black bg-gray-50" : "border-gray-300 bg-white"}`}
            >
              {companyLogoPreview ? (
                <div className="flex flex-col items-center gap-3">
                  <Image
                    src={companyLogoPreview}
                    alt="Company logo preview"
                    width={96}
                    height={96}
                    className="rounded-xl object-cover"
                  />
                  <p className="text-sm text-gray-700">{companyLogoName}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-800">
                    Drag and drop your company logo here
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                </div>
              )}
              <button
                type="button"
                className="mt-4 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
                onClick={() => companyLogoInputRef.current?.click()}
              >
                Browse file
              </button>
            </div>
            {errors.companyLogo && (
              <p className="mt-2 text-sm text-red-600">
                {errors.companyLogo.message}
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
            disabled={!isValid || isSubmitting || checkingUsername}
            className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer"
          >
            {isSubmitting || checkingUsername
              ? "Creating account..."
              : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
