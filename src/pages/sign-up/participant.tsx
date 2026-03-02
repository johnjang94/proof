import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useForm, useWatch } from "react-hook-form";
import { supabase } from "@/lib/supabaseInstance";

type FormValues = {
  username: string;
  email: string;
  password: string;
  retypePassword: string;
  firstName: string;
  lastName: string;
  avatar: FileList | null;
};

type ProfileBase = {
  username: string;
  first_name: string;
  last_name: string;
  role: "participant";
  avatar_url: string | null;
};

const PROFILE_ID_COL: "id" | "user_id" = "id";

type ProfileById = { id: string } & ProfileBase;
type ProfileByUserId = { user_id: string } & ProfileBase;

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
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { avatar: null },
  });

  const passwordValue = useWatch({
    control,
    name: "password",
  });

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

  const uploadAvatar = async (userId: string, file: File) => {
    const r = await fetch("/api/r2/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileType: file.type, userId }),
    });

    if (!r.ok) {
      const msg = await r.text().catch(() => "");
      throw new Error(`Failed to create upload URL. ${msg}`);
    }

    const { uploadUrl, key } = (await r.json()) as {
      uploadUrl: string;
      key: string;
    };

    const put = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!put.ok) throw new Error("Avatar upload failed");

    const base = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL;
    if (!base) throw new Error("Missing NEXT_PUBLIC_R2_PUBLIC_BASE_URL");

    return `${base}/${key}`;
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

    const username = values.username.trim().toLowerCase();
    const email = values.email.trim();
    const firstName = values.firstName.trim();
    const lastName = values.lastName.trim();

    setCheckingUsername(true);
    setCheckingUsername(false);

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
      router.replace("/welcome/introduction");
      return;
    }

    const u = signUpData.user;
    if (!u) {
      setAuthError("Sign up succeeded but user was not returned.");
      return;
    }

    const file = values.avatar?.item?.(0) ?? null;

    try {
      const avatarUrl = file ? await uploadAvatar(u.id, file) : null;

      await upsertProfile(u.id, {
        username,
        first_name: firstName,
        last_name: lastName,
        role: "participant",
        avatar_url: avatarUrl,
      });

      router.replace("/welcome/introduction");
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">First name</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              autoComplete="given-name"
              {...register("firstName", { required: "First name is required" })}
            />
            {errors.firstName?.message ? (
              <p className="text-sm text-red-600">{errors.firstName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Last name</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              autoComplete="family-name"
              {...register("lastName", { required: "Last name is required" })}
            />
            {errors.lastName?.message ? (
              <p className="text-sm text-red-600">{errors.lastName.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Username</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            autoComplete="username"
            {...register("username", {
              required: "Username is required",
              minLength: { value: 2, message: "Too short" },
              maxLength: { value: 20, message: "Too long" },
              validate: (v) =>
                usernamePattern.test(v.trim()) || "Letters only (A–Z)",
            })}
          />
          {errors.username?.message ? (
            <p className="text-sm text-red-600">{errors.username.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            type="email"
            autoComplete="email"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email?.message ? (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            type="password"
            autoComplete="new-password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Min 8 chars" },
              onChange: async () => {
                await trigger("retypePassword");
              },
            })}
          />
          {errors.password?.message ? (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          ) : null}
        </div>

        {/* ✅ Retype Password (added right after Password) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Retype password</label>
          <input
            className="w-full rounded-lg border px-3 py-2"
            type="password"
            autoComplete="new-password"
            {...register("retypePassword", {
              required: "Please retype your password",
              validate: (v) => v === passwordValue || "Passwords do not match",
            })}
          />
          {errors.retypePassword?.message ? (
            <p className="text-sm text-red-600">
              {errors.retypePassword.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Profile photo</label>

          <div
            className={[
              "rounded-xl border p-4 transition",
              dragActive ? "border-black" : "border-dashed",
            ].join(" ")}
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
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                fileInputRef.current?.click();
            }}
          >
            <div className="flex items-center gap-4">
              <div className="h-12.5 w-12.5 overflow-hidden rounded-full border">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-100" />
                )}
              </div>

              {avatarName ? (
                <p className="text-sm font-medium truncate">{avatarName}</p>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Drop an image or click to browse
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>

                  <button
                    type="button"
                    className="rounded-lg border px-3 py-2 text-sm hover:cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Browse
                  </button>
                </>
              )}
            </div>

            <input
              {...avatarRegister}
              ref={(el) => {
                avatarRegister.ref(el);
                fileInputRef.current = el;
              }}
              className="hidden"
              type="file"
              accept="image/*"
              onChange={onBrowsePick}
            />
          </div>

          {errors.avatar?.message ? (
            <p className="text-sm text-red-600">
              {String(errors.avatar.message)}
            </p>
          ) : null}
        </div>

        {authError ? <p className="text-sm text-red-600">{authError}</p> : null}

        <button
          type="submit"
          disabled={!isValid || isSubmitting || checkingUsername}
          className="w-full rounded-xl bg-black px-4 py-3 text-white disabled:opacity-50 hover:cursor-pointer"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </main>
  );
}
