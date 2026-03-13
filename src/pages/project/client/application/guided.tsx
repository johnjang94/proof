"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseInstance";
import { apiFetch } from "@/lib/apiFetch";
import { uploadAsset } from "@/services/upload/uploadAsset";
import Image from "next/image";

type FormState = {
  projectName: string;
  projectDescription: string;
  goals: string;
  projectDeadline: string;
  estimatedBudget: string;
};

type FileState = {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  url: string | null;
  error: string | null;
};

const EMPTY_FORM: FormState = {
  projectName: "",
  projectDescription: "",
  goals: "",
  projectDeadline: "",
  estimatedBudget: "",
};

const EMPTY_FILE: FileState = {
  file: null,
  preview: null,
  uploading: false,
  url: null,
  error: null,
};

export default function ProjectIntake() {
  const id = useId();
  const router = useRouter();

  const thumbInputRef = useRef<HTMLInputElement | null>(null);
  const mp4InputRef = useRef<HTMLInputElement | null>(null);

  const thumbUrlRef = useRef<string | null>(null);
  const mp4UrlRef = useRef<string | null>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [thumb, setThumb] = useState<FileState>(EMPTY_FILE);
  const [mp4, setMp4] = useState<FileState>(EMPTY_FILE);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    const requiredText =
      form.projectName.trim() &&
      form.projectDeadline.trim() &&
      form.estimatedBudget.trim() &&
      form.projectDescription.trim() &&
      form.goals.trim();

    return (
      !!requiredText &&
      !!thumb.file &&
      !thumb.uploading &&
      !mp4.uploading &&
      !submitting
    );
  }, [form, thumb, mp4.uploading, submitting]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setForm((prev) => ({ ...prev, estimatedBudget: raw }));
  };

  const startUpload = async (
    file: File,
    kind: "project-thumbnail" | "project-mp4",
    setState: React.Dispatch<React.SetStateAction<FileState>>,
    urlRef: React.MutableRefObject<string | null>,
  ) => {
    setState((prev) => ({ ...prev, uploading: true, url: null, error: null }));
    urlRef.current = null;

    try {
      const url = await uploadAsset(file, kind);
      urlRef.current = url;
      setState((prev) => ({ ...prev, uploading: false, url }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        uploading: false,
        error: error instanceof Error ? error.message : "Upload failed.",
      }));
    }
  };

  const onPickThumbnail = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setThumb({ ...EMPTY_FILE, error: "Only image files allowed." });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setThumb({ ...EMPTY_FILE, error: "Max 10MB." });
      return;
    }
    const preview = URL.createObjectURL(file);
    setThumb({ file, preview, uploading: false, url: null, error: null });
    startUpload(file, "project-thumbnail", setThumb, thumbUrlRef);
  };

  const onPickMp4 = (file?: File) => {
    if (!file) return;
    if (file.type !== "video/mp4") {
      setMp4({ ...EMPTY_FILE, error: "Only MP4 files allowed." });
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setMp4({ ...EMPTY_FILE, error: "Max 100MB." });
      return;
    }
    setMp4({ file, preview: null, uploading: false, url: null, error: null });
    startUpload(file, "project-mp4", setMp4, mp4UrlRef);
  };

  const removeThumbnail = () => {
    if (thumb.preview) URL.revokeObjectURL(thumb.preview);
    thumbUrlRef.current = null;
    setThumb(EMPTY_FILE);
    if (thumbInputRef.current) thumbInputRef.current.value = "";
  };

  const removeMp4 = () => {
    mp4UrlRef.current = null;
    setMp4(EMPTY_FILE);
    if (mp4InputRef.current) mp4InputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        alert("You need to login first");
        return;
      }

      const thumbnailUrl =
        thumbUrlRef.current ??
        (await uploadAsset(thumb.file!, "project-thumbnail"));
      const mp4Url = mp4.file
        ? (mp4UrlRef.current ?? (await uploadAsset(mp4.file, "project-mp4")))
        : null;

      const res = await apiFetch("/project-intakes", {
        method: "POST",
        body: JSON.stringify({
          projectName: form.projectName.trim(),
          projectDescription: form.projectDescription.trim(),
          expectedOutcome: form.goals.trim(),
          projectDeadline: form.projectDeadline,
          estimatedBudget: Number(form.estimatedBudget),
          thumbnailUrl,
          videoUrl: mp4Url,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Submit failed (${res.status}). ${text}`);
      }

      if (thumb.preview) URL.revokeObjectURL(thumb.preview);
      await router.push("/main/client/landing?created=1");
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-xl border bg-white px-6 py-4">
          <h1 className="text-sm font-semibold tracking-wide text-gray-900">
            PROJECT INTAKE
          </h1>
        </div>

        <div className="bg-gray-50 py-3">
          <div className="rounded-md px-6">
            <form onSubmit={handleSubmit}>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Project Information
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Our HR team will review and structure your project to ensure
                  optimal resource alignment and execution strategy.
                </p>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor={`${id}-name`}
                    className="block text-sm font-medium text-gray-900"
                  >
                    Name of the project
                  </label>
                  <input
                    id={`${id}-name`}
                    name="projectName"
                    value={form.projectName}
                    onChange={handleChange}
                    type="text"
                    placeholder="i.e. Bloom the Flowers"
                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`${id}-desc`}
                    className="block text-sm font-medium text-gray-900"
                  >
                    Project Description
                  </label>
                  <textarea
                    id={`${id}-desc`}
                    name="projectDescription"
                    value={form.projectDescription}
                    onChange={handleChange}
                    rows={5}
                    placeholder="i.e. Nexus Logistics is in an attempt to deliver the supplies within 24 hours since the moment they receive referrals"
                    className="mt-2 w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`${id}-goals`}
                    className="block text-sm font-medium text-gray-900"
                  >
                    Expected Outcome
                  </label>
                  <textarea
                    id={`${id}-goals`}
                    name="goals"
                    value={form.goals}
                    onChange={handleChange}
                    rows={4}
                    placeholder="i.e. Once this project is implemented, Nexus Logistics should have improved routing system that indicates how to shorten the delivery time."
                    className="mt-2 w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`${id}-deadline`}
                    className="block text-sm font-medium text-gray-900"
                  >
                    Project Deadline
                  </label>
                  <input
                    id={`${id}-deadline`}
                    name="projectDeadline"
                    value={form.projectDeadline}
                    onChange={handleChange}
                    type="date"
                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`${id}-budget`}
                    className="block text-sm font-medium text-gray-900"
                  >
                    Estimated Budget
                  </label>
                  <input
                    id={`${id}-budget`}
                    name="estimatedBudget"
                    value={form.estimatedBudget}
                    onChange={handleBudgetChange}
                    type="text"
                    inputMode="numeric"
                    placeholder="i.e. 5000"
                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-medium text-gray-900">
                      Project Thumbnail
                    </label>
                    <span className="rounded bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                      required
                    </span>
                  </div>

                  <div
                    onClick={() =>
                      !thumb.uploading && thumbInputRef.current?.click()
                    }
                    className={`mt-2 relative flex cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 bg-gray-50 px-6 py-10 text-center hover:bg-gray-100 ${thumb.uploading ? "cursor-not-allowed" : ""}`}
                  >
                    {thumb.uploading && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-md bg-white/80">
                        <svg
                          className="h-8 w-8 animate-spin text-sky-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                        <p className="mt-2 text-sm font-medium text-sky-600">
                          Uploading...
                        </p>
                      </div>
                    )}

                    {thumb.preview ? (
                      <Image
                        src={thumb.preview}
                        alt="thumbnail preview"
                        width={128}
                        height={128}
                        className="mb-3 rounded-md object-cover"
                      />
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-10 w-10 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 16V4" />
                        <path d="M7 9l5-5 5 5" />
                        <path d="M20 16v4H4v-4" />
                      </svg>
                    )}

                    <div className="mt-3 text-sm font-medium text-gray-800">
                      {thumb.uploading
                        ? "Uploading..."
                        : thumb.file
                          ? thumb.file.name
                          : "Drag & Drop your photo here"}
                    </div>

                    <div className="text-xs text-gray-500">
                      {thumb.url
                        ? "Uploaded ✅"
                        : thumb.uploading
                          ? "Please wait..."
                          : "…or click here to browse"}
                    </div>

                    <div className="mt-2 text-[11px] text-gray-500">
                      supported file types: .jpg, .png, .webp
                    </div>

                    {thumb.error ? (
                      <div className="mt-2 text-xs text-red-600">
                        {thumb.error}
                      </div>
                    ) : null}
                  </div>

                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => onPickThumbnail(e.target.files?.[0])}
                  />

                  {thumb.file ? (
                    <button
                      type="button"
                      className="mt-2 text-xs text-gray-600 hover:text-gray-900"
                      onClick={removeThumbnail}
                      disabled={thumb.uploading}
                    >
                      Remove Thumbnail
                    </button>
                  ) : null}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-medium text-gray-900">
                      Project Description (MP4)
                    </label>
                    <span className="rounded bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                      optional
                    </span>
                  </div>

                  <div
                    onClick={() =>
                      !mp4.uploading && mp4InputRef.current?.click()
                    }
                    className={`mt-2 relative flex cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 bg-gray-50 px-6 py-10 text-center hover:bg-gray-100 ${mp4.uploading ? "cursor-not-allowed" : ""}`}
                  >
                    {mp4.uploading && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-md bg-white/80">
                        <svg
                          className="h-8 w-8 animate-spin text-sky-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          />
                        </svg>
                        <p className="mt-2 text-sm font-medium text-sky-600">
                          Uploading...
                        </p>
                      </div>
                    )}

                    <svg
                      viewBox="0 0 24 24"
                      className="h-10 w-10 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 16V4" />
                      <path d="M7 9l5-5 5 5" />
                      <path d="M20 16v4H4v-4" />
                    </svg>

                    <div className="mt-3 text-sm font-medium text-gray-800">
                      {mp4.uploading
                        ? "Uploading..."
                        : mp4.file
                          ? mp4.file.name
                          : "Drag & Drop your video here"}
                    </div>

                    <div className="text-xs text-gray-500">
                      {mp4.url
                        ? "Uploaded ✅"
                        : mp4.uploading
                          ? "Please wait..."
                          : "…or click here to browse"}
                    </div>

                    <div className="mt-2 text-[11px] text-gray-500">
                      supported file type: .mp4
                    </div>

                    {mp4.error ? (
                      <div className="mt-2 text-xs text-red-600">
                        {mp4.error}
                      </div>
                    ) : null}
                  </div>

                  <input
                    ref={mp4InputRef}
                    type="file"
                    accept="video/mp4"
                    className="hidden"
                    onChange={(e) => onPickMp4(e.target.files?.[0])}
                  />

                  {mp4.file ? (
                    <button
                      type="button"
                      className="mt-2 text-xs text-gray-600 hover:text-gray-900"
                      onClick={removeMp4}
                      disabled={mp4.uploading}
                    >
                      Remove MP4
                    </button>
                  ) : null}
                </div>

                <div className="mt-2 flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="cursor-pointer rounded-md bg-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 disabled:opacity-50"
                  >
                    {submitting
                      ? "Submitting..."
                      : thumb.uploading
                        ? "Uploading..."
                        : "Submit"}
                  </button>
                </div>

                {!thumb.file ? (
                  <p className="text-xs text-gray-500">
                    * You need to select a thumbnail in order to proceed
                  </p>
                ) : null}
              </div>
            </form>
          </div>
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
