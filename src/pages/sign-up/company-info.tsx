"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { uploadAsset } from "@/services/upload/uploadAsset";
import { apiFetch } from "@/lib/apiFetch";

type FormValues = {
  companyName: string;
  industry: string;
  registeredNumber: string;
  serviceDescription: string;
  companyLogo: FileList | null;
};

type SignupPartial = {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
};

export default function CompanyInfo() {
  const router = useRouter();

  const [authError, setAuthError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [logoName, setLogoName] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const logoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem("signup_partial");
    if (!raw) {
      router.replace("/sign-up/client");
    }
  }, [router]);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      companyName: "",
      industry: "",
      registeredNumber: "",
      serviceDescription: "",
      companyLogo: null,
    },
  });

  const logoRegister = register("companyLogo", {
    validate: (files) => {
      const file = files?.item?.(0);
      if (!file) return true;
      if (!file.type.startsWith("image/")) return "Only image files allowed";
      if (file.size > 5 * 1024 * 1024) return "Max 5MB";
      return true;
    },
  });

  const setLogoFromFile = async (file: File) => {
    const dt = new DataTransfer();
    dt.items.add(file);

    setValue("companyLogo", dt.files, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    await trigger("companyLogo");

    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });

    setLogoName(file.name);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    await setLogoFromFile(file);
  };

  const onLogoPick: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    logoRegister.onChange(e);

    const file = e.target.files?.[0];
    if (!file) return;

    await setLogoFromFile(file);
    e.target.value = "";
  };

  const onSubmit = async (values: FormValues) => {
    setAuthError(null);

    try {
      const raw = sessionStorage.getItem("signup_partial");
      if (!raw) {
        setAuthError("Session expired. Please start sign-up again.");
        router.replace("/sign-up/client");
        return;
      }

      const partial = JSON.parse(raw) as SignupPartial;

      const logoFile = values.companyLogo?.item?.(0) ?? null;
      const logoUrl = logoFile
        ? await uploadAsset(logoFile, "company-logo")
        : null;

      await apiFetch("/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: partial.userId,
          username: partial.username,
          firstName: partial.firstName,
          lastName: partial.lastName,
          avatarUrl: partial.avatarUrl,
          companyName: values.companyName.trim(),
          industry: values.industry.trim(),
          registeredNumber: values.registeredNumber.trim(),
          serviceDescription: values.serviceDescription.trim(),
          companyLogoUrl: logoUrl,
        }),
      });

      sessionStorage.removeItem("signup_partial");
      router.replace("/welcome/client/introduction");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setAuthError(message);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#f7f7f7] px-6 py-10 transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Company Information
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Tell us about your company so participants can understand who
            they&apos;re working with.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1.5 w-16 rounded-full bg-gray-200" />
            <div className="h-1.5 w-16 rounded-full bg-black" />
            <span className="ml-2 text-xs text-gray-400">Step 2 of 2</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Company Name
            </label>
            <input
              type="text"
              autoComplete="organization"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
              placeholder="e.g. Nexus Logistics Inc."
              {...register("companyName", {
                required: "Company name is required",
                validate: (v) => v.trim() !== "" || "Company name is required",
              })}
            />
            {errors.companyName && (
              <p className="mt-2 text-sm text-red-600">
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Industry
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
              placeholder="e.g. Logistics, FinTech, Healthcare"
              {...register("industry", {
                required: "Industry is required",
                validate: (v) => v.trim() !== "" || "Industry is required",
              })}
            />
            {errors.industry && (
              <p className="mt-2 text-sm text-red-600">
                {errors.industry.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Registered Company Number{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
              placeholder="e.g. 1234567"
              {...register("registeredNumber")}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              What does your company do?
            </label>
            <textarea
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
              placeholder="i.e. Nexus Logistics is a retail logistics that delivers supplies from a number of manufacturers to individual retail stores"
              {...register("serviceDescription", {
                required: "Please describe your company's service or product",
                validate: (v) =>
                  v.trim() !== "" ||
                  "Please describe your company's service or product",
              })}
            />
            {errors.serviceDescription && (
              <p className="mt-2 text-sm text-red-600">
                {errors.serviceDescription.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Company Logo{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              ref={(el) => {
                logoRegister.ref(el);
                logoInputRef.current = el;
              }}
              type="file"
              accept="image/*"
              className="hidden"
              name={logoRegister.name}
              onBlur={logoRegister.onBlur}
              onChange={onLogoPick}
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
              {logoPreview ? (
                <div className="flex flex-col items-center gap-3">
                  <Image
                    src={logoPreview}
                    alt="Company logo preview"
                    width={96}
                    height={96}
                    className="rounded-xl object-cover"
                  />
                  <p className="text-sm text-gray-700">{logoName}</p>
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
                onClick={() => logoInputRef.current?.click()}
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

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/sign-up/client")}
              className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="flex-1 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
