"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseInstance";
import { apiFetch } from "@/lib/apiFetch";
import { uploadAsset } from "@/services/upload/uploadAsset";
import Image from "next/image";

type Part1State = {
  projectName: string;
  projectDescription: string;
  expectedOutcome: string;
  budgetAllowance: string;
  projectDeadline: string;
};

type FileState = {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  url: string | null;
  error: string | null;
};

const EMPTY_FILE: FileState = {
  file: null,
  preview: null,
  uploading: false,
  url: null,
  error: null,
};

const EMPTY_PART1: Part1State = {
  projectName: "Test Project",
  projectDescription:
    "This is a test project description for development purposes.",
  expectedOutcome: "Increase efficiency by 30% and improve user satisfaction.",
  budgetAllowance: "5000",
  projectDeadline: "2026-12-31",
};

type SlideDirection = "enter-right" | "enter-left" | "idle";

function useSlide() {
  const [slide, setSlide] = useState<SlideDirection>("idle");
  const [part, setPart] = useState<1 | 2 | 3>(1);

  const goNext = () => {
    setSlide("enter-right");
    setTimeout(() => {
      setPart((p) => (p < 3 ? ((p + 1) as 2 | 3) : p));
      setSlide("idle");
    }, 350);
  };

  const goPrev = () => {
    setSlide("enter-left");
    setTimeout(() => {
      setPart((p) => (p > 1 ? ((p - 1) as 1 | 2) : p));
      setSlide("idle");
    }, 350);
  };

  return { part, slide, goNext, goPrev };
}

const slideStyle = (slide: SlideDirection): React.CSSProperties => {
  if (slide === "enter-right")
    return {
      transform: "translateX(40px)",
      opacity: 0,
      transition: "transform 350ms ease, opacity 350ms ease",
    };
  if (slide === "enter-left")
    return {
      transform: "translateX(-40px)",
      opacity: 0,
      transition: "transform 350ms ease, opacity 350ms ease",
    };
  return {
    transform: "translateX(0)",
    opacity: 1,
    transition: "transform 350ms ease, opacity 350ms ease",
  };
};

export default function Guided() {
  const uid = useId();
  const router = useRouter();
  const { part, slide, goNext, goPrev } = useSlide();

  const thumbInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const thumbUrlRef = useRef<string | null>(null);
  const videoUrlRef = useRef<string | null>(null);

  const [form, setForm] = useState<Part1State>(EMPTY_PART1);
  const [part1Errors, setPart1Errors] = useState<Partial<Part1State>>({});
  const [thumb, setThumb] = useState<FileState>(EMPTY_FILE);
  const [video, setVideo] = useState<FileState>(EMPTY_FILE);
  const [submitting, setSubmitting] = useState(false);

  const validatePart1 = (): boolean => {
    const errs: Partial<Part1State> = {};
    if (!form.projectName.trim()) errs.projectName = "Required";
    if (!form.projectDescription.trim()) errs.projectDescription = "Required";
    if (!form.expectedOutcome.trim()) errs.expectedOutcome = "Required";
    if (!form.budgetAllowance) errs.budgetAllowance = "Required";
    if (!form.projectDeadline) errs.projectDeadline = "Required";
    setPart1Errors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (part1Errors[name as keyof Part1State]) {
      setPart1Errors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const startUpload = async (
    file: File,
    kind: "project-thumbnail" | "project-video",
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

  const onPickThumb = (file?: File) => {
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

  const onPickVideo = (file?: File) => {
    if (!file) return;
    const allowed = ["video/mp4", "video/quicktime", "video/webm"];
    if (!allowed.includes(file.type)) {
      setVideo({ ...EMPTY_FILE, error: "Only MP4, MOV, WEBM files allowed." });
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      setVideo({ ...EMPTY_FILE, error: "Max 200MB." });
      return;
    }
    setVideo({ file, preview: null, uploading: false, url: null, error: null });
    startUpload(file, "project-video", setVideo, videoUrlRef);
  };

  const removeThumb = () => {
    if (thumb.preview) URL.revokeObjectURL(thumb.preview);
    thumbUrlRef.current = null;
    setThumb(EMPTY_FILE);
    if (thumbInputRef.current) thumbInputRef.current.value = "";
  };

  const removeVideo = () => {
    videoUrlRef.current = null;
    setVideo(EMPTY_FILE);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const thumbReady = useMemo(
    () => !!thumb.file && !thumb.uploading && !thumb.error,
    [thumb],
  );

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("You need to be logged in.");
        return;
      }

      const thumbnailUrl =
        thumbUrlRef.current ??
        (thumb.file
          ? await uploadAsset(thumb.file, "project-thumbnail")
          : null);

      const videoUrl = video.file
        ? (videoUrlRef.current ??
          (await uploadAsset(video.file, "project-video")))
        : null;

      const res = await apiFetch("/project-intakes", {
        method: "POST",
        body: JSON.stringify({
          projectName: form.projectName.trim(),
          projectDescription: form.projectDescription.trim(),
          expectedOutcome: form.expectedOutcome.trim(),
          budgetAllowance: form.budgetAllowance,
          projectDeadline: new Date(form.projectDeadline).toISOString(),
          thumbnailUrl,
          videoUrl,
          submissionType: "guided",
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

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  return (
    <div className="min-h-[85vh]">
      <div className="mx-auto px-14 py-8">
        <div className="mb-6 rounded-xl border bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-semibold tracking-wide text-gray-900">
              PROJECT APPLICATION
            </h1>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`h-2 w-8 rounded-full transition-colors duration-300 ${
                    n <= part ? "bg-black" : "bg-gray-200"
                  }`}
                />
              ))}
              <span className="ml-1 text-xs text-gray-400">
                {part === 1
                  ? "Basic Info"
                  : part === 2
                    ? "Thumbnail"
                    : "Intro Video"}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white">
          <div style={slideStyle(slide)} className="px-6 py-8">
            {part === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Project Details
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Fill in the core information about your project.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor={`${uid}-name`}
                    className="block text-sm font-medium text-gray-900"
                  >
                    Project Name
                  </label>
                  <input
                    id={`${uid}-name`}
                    name="projectName"
                    value={form.projectName}
                    onChange={handleChange}
                    type="text"
                    placeholder="e.g. Bloom the Flowers"
                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                  />
                  {part1Errors.projectName && (
                    <p className="mt-1 text-xs text-red-600">
                      {part1Errors.projectName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`${uid}-desc`}
                    className="block text-sm font-medium text-gray-900"
                  >
                    Project Description
                  </label>
                  <textarea
                    id={`${uid}-desc`}
                    name="projectDescription"
                    value={form.projectDescription}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe what this project entails..."
                    className="mt-2 w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                  />
                  {part1Errors.projectDescription && (
                    <p className="mt-1 text-xs text-red-600">
                      {part1Errors.projectDescription}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`${uid}-outcome`}
                    className="block text-sm font-medium text-gray-900"
                  >
                    Expected Outcome
                  </label>
                  <textarea
                    id={`${uid}-outcome`}
                    name="expectedOutcome"
                    value={form.expectedOutcome}
                    onChange={handleChange}
                    rows={3}
                    placeholder="e.g. Increase conversion rate by 20%, improve user onboarding..."
                    className="mt-2 w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                  />
                  {part1Errors.expectedOutcome && (
                    <p className="mt-1 text-xs text-red-600">
                      {part1Errors.expectedOutcome}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`${uid}-budget`}
                    className="block text-sm font-medium text-gray-900"
                  >
                    Budget Allowance
                  </label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      $
                    </span>
                    <input
                      id={`${uid}-budget`}
                      name="budgetAllowance"
                      type="number"
                      min={0}
                      value={form.budgetAllowance}
                      onChange={handleChange}
                      placeholder="e.g. 3000"
                      className="w-full rounded-md border border-gray-300 bg-white py-2 pl-7 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                    />
                  </div>
                  {part1Errors.budgetAllowance && (
                    <p className="mt-1 text-xs text-red-600">
                      {part1Errors.budgetAllowance}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor={`${uid}-deadline`}
                    className="block text-sm font-medium text-gray-900"
                  >
                    Project Deadline
                  </label>
                  <input
                    id={`${uid}-deadline`}
                    name="projectDeadline"
                    type="date"
                    min={todayStr}
                    value={form.projectDeadline}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
                  />
                  {part1Errors.projectDeadline && (
                    <p className="mt-1 text-xs text-red-600">
                      {part1Errors.projectDeadline}
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (validatePart1()) goNext();
                    }}
                    className="rounded-md bg-sky-500 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-600"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {part === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Project Thumbnail
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Upload a cover image for your project listing.{" "}
                    <span className="font-medium text-gray-700">Required.</span>
                  </p>
                </div>

                <div
                  onClick={() =>
                    !thumb.uploading && thumbInputRef.current?.click()
                  }
                  className={`relative flex cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 bg-gray-50 px-6 py-12 text-center hover:bg-gray-100 ${
                    thumb.uploading ? "cursor-not-allowed" : ""
                  }`}
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
                      width={160}
                      height={160}
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
                        : "Drag & Drop or click to browse"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {thumb.url
                      ? "Uploaded ✅"
                      : thumb.uploading
                        ? "Please wait..."
                        : "JPG, PNG, WEBP · max 10MB"}
                  </div>
                  {thumb.error && (
                    <div className="mt-2 text-xs text-red-600">
                      {thumb.error}
                    </div>
                  )}
                </div>

                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => onPickThumb(e.target.files?.[0])}
                />

                {thumb.file && (
                  <button
                    type="button"
                    className="text-xs text-gray-600 hover:text-gray-900"
                    onClick={removeThumb}
                    disabled={thumb.uploading}
                  >
                    Remove thumbnail
                  </button>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    disabled={!thumbReady}
                    onClick={goNext}
                    className="rounded-md bg-sky-500 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
                {!thumb.file && (
                  <p className="text-xs text-gray-500">
                    * A thumbnail is required to proceed.
                  </p>
                )}
              </div>
            )}

            {part === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Introduction Video{" "}
                    <span className="text-xs font-normal text-gray-400">
                      (optional)
                    </span>
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Upload a short video introducing your project to potential
                    participants. This can help attract the right talent.
                  </p>
                </div>

                <div
                  onClick={() =>
                    !video.uploading && videoInputRef.current?.click()
                  }
                  className={`relative flex cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 bg-gray-50 px-6 py-12 text-center hover:bg-gray-100 ${
                    video.uploading ? "cursor-not-allowed" : ""
                  }`}
                >
                  {video.uploading && (
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
                    <rect x="2" y="7" width="15" height="10" rx="2" />
                    <path d="M17 9l5-3v12l-5-3" />
                  </svg>

                  <div className="mt-3 text-sm font-medium text-gray-800">
                    {video.uploading
                      ? "Uploading..."
                      : video.file
                        ? video.file.name
                        : "Drag & Drop or click to browse"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {video.url
                      ? "Uploaded ✅"
                      : video.uploading
                        ? "Please wait..."
                        : "MP4, MOV, WEBM · max 200MB"}
                  </div>
                  {video.error && (
                    <div className="mt-2 text-xs text-red-600">
                      {video.error}
                    </div>
                  )}
                </div>

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  className="hidden"
                  onChange={(e) => onPickVideo(e.target.files?.[0])}
                />

                {video.file && (
                  <button
                    type="button"
                    className="text-xs text-gray-600 hover:text-gray-900"
                    onClick={removeVideo}
                    disabled={video.uploading}
                  >
                    Remove video
                  </button>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    disabled={submitting || video.uploading}
                    onClick={handleSubmit}
                    className="cursor-pointer rounded-md bg-sky-500 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 disabled:opacity-50"
                  >
                    {submitting
                      ? "Submitting..."
                      : video.uploading
                        ? "Uploading..."
                        : "Submit"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
