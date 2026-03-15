"use client";

import { useRouter } from "next/router";
import { useMemo, useRef, useState } from "react";
import { FiUpload } from "react-icons/fi";
import { apiFetch } from "@/lib/apiFetch";
import { useProjectDetail } from "@/hooks/useProjectDetail";
import { isPopularProject, isNewProject } from "@/lib/projectUtils";
import {
  ProjectBanner,
  ProjectBreadcrumb,
  ProjectErrorState,
  ProjectLoadingSkeleton,
  ProjectTitle,
} from "@/components/project/prject-shared";

const BOTTOM_STEPS = [
  {
    step: 2,
    label: "Interview",
    description:
      "Participate in a video interview to discuss your experience and fit for the team",
  },
  {
    step: 3,
    label: "Selection",
    description: "Applicants will be notified whether they are chosen",
  },
];

function getMimeType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "doc") return "application/msword";
  if (ext === "docx")
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return file.type;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out. Please try again.`)),
        ms,
      ),
    ),
  ]);
}

export default function FirstStep() {
  const router = useRouter();
  const { id } = router.query;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { project, loading, pageError } = useProjectDetail(id, router.isReady);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [portfolioLink, setPortfolioLink] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<
    "idle" | "uploading" | "submitting"
  >("idle");

  const popular = useMemo(
    () => isPopularProject(project?.viewCount),
    [project?.viewCount],
  );
  const isNew = useMemo(
    () => !popular && isNewProject(project?.createdAt),
    [popular, project?.createdAt],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setResumeFile(file);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setResumeFile(file);
  };

  const handleSubmit = async () => {
    setSubmitError("");

    if (!firstName.trim() || !lastName.trim()) {
      setSubmitError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setSubmitError("Please enter your email.");
      return;
    }
    if (!resumeFile) {
      setSubmitError("Please upload your resume.");
      return;
    }
    if (!agreed) {
      setSubmitError("Please agree to the terms and conditions.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitStep("uploading");

      const mimeType = getMimeType(resumeFile);

      const presignRes = await withTimeout(
        apiFetch("/uploads/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "resume",
            filename: resumeFile.name,
            contentType: mimeType,
          }),
        }),
        15_000,
        "Getting upload URL",
      );

      if (!presignRes.ok) throw new Error("Failed to get upload URL.");

      const { uploadUrl, key } = await presignRes.json();

      const uploadRes = await withTimeout(
        fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": mimeType },
          body: resumeFile,
        }),
        30_000,
        "Uploading resume",
      );

      if (!uploadRes.ok) throw new Error("Failed to upload resume.");

      setSubmitStep("submitting");

      const applyRes = await withTimeout(
        apiFetch("/project-applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: id,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            resumeR2Key: key,
            ...(portfolioLink.trim() && {
              portfolioLink: portfolioLink.trim(),
            }),
          }),
        }),
        15_000,
        "Submitting application",
      );

      const applyData = await applyRes.json().catch(() => ({}));

      if (!applyRes.ok) {
        throw new Error(applyData?.message ?? "Failed to submit application.");
      }

      const position = applyData?.position ?? "";
      router.push(
        `/project/participant/application/success/${id}?position=${encodeURIComponent(position)}`,
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Submission failed.",
      );
    } finally {
      setSubmitting(false);
      setSubmitStep("idle");
    }
  };

  const submitLabel =
    submitStep === "uploading"
      ? "Uploading resume..."
      : submitStep === "submitting"
        ? "Submitting application..."
        : "Submit Application ➤";

  if (loading) return <ProjectLoadingSkeleton />;
  if (pageError || !project)
    return (
      <ProjectErrorState message={pageError} onBack={() => router.back()} />
    );

  return (
    <main className="min-h-screen py-5 text-[#111111]">
      <div className="mx-auto md:px-12 px-5">
        <ProjectBreadcrumb
          companyName={project.companyName}
          companyLogoUrl={project.companyLogoUrl}
        />

        <ProjectBanner
          thumbnailUrl={project.thumbnailUrl}
          projectName={project.projectName}
        />

        <ProjectTitle
          projectName={project.projectName}
          isNew={isNew}
          isPopular={popular}
        />

        <div className="mb-5 rounded-2xl bg-[#f0f0f0] px-5 py-4 text-center">
          <p className="text-[17px] font-semibold text-[#111111]">
            Application
          </p>
          <p className="text-[13px] text-[#444444]">
            This is the first step of our 3-step process
          </p>
        </div>

        <div className="mb-6 rounded-2xl bg-white px-5 py-5 shadow-sm border border-gray-100">
          <div className="mb-5 flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
              1
            </span>
            <p className="text-[15px] font-semibold text-[#111111]">
              Fill out the application
            </p>
          </div>

          <div className="mb-4 flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-[13px] text-[#111111]">
                First name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-[14px] outline-none focus:border-gray-400"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-[13px] text-[#111111]">
                Last name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-[14px] outline-none focus:border-gray-400"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-[13px] text-[#111111]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-[14px] outline-none focus:border-gray-400"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-[13px] text-[#111111]">
              Portfolio Link{" "}
              <span className="text-[12px] text-[#aaa]">(optional)</span>
            </label>
            <input
              type="url"
              value={portfolioLink}
              onChange={(e) => setPortfolioLink(e.target.value)}
              placeholder="https://"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-[14px] outline-none focus:border-gray-400"
            />
          </div>

          {/* Resume Upload */}
          <div className="mb-4">
            <label className="mb-1 block text-[13px] text-[#111111]">
              Resume / CV
            </label>
            <div
              onClick={() => !resumeFile && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex min-h-45 flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-6 text-center transition ${
                resumeFile
                  ? "border-green-400 bg-green-50 cursor-default"
                  : isDragging
                    ? "border-gray-400 bg-gray-100 cursor-copy"
                    : "border-gray-300 bg-white cursor-pointer"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              {resumeFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-[14px] font-semibold text-green-700">
                    {resumeFile.name}
                  </p>
                  <p className="text-[12px] text-green-600">
                    {formatFileSize(resumeFile.size)}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setResumeFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="mt-1 text-[12px] text-[#888] underline hover:text-[#444]"
                  >
                    Remove and re-upload
                  </button>
                </div>
              ) : (
                <>
                  <FiUpload className="mb-2 text-[28px] text-[#111111]" />
                  <p className="text-[14px] font-medium text-[#111111]">
                    Drag & Drop your resume here
                  </p>
                  <p className="text-[13px] text-[#888]">
                    ...or click here to browse
                  </p>
                  <p className="mt-1 text-[12px] text-[#aaa]">
                    supported file types: PDF, DOC, DOCX
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="mb-4 rounded-xl bg-[#fff8f8] px-4 py-3">
            <p className="mb-1 text-[13px] font-semibold text-red-500">
              ⓘ Notice
            </p>
            <p className="text-[13px] text-red-500">
              Please read more on the{" "}
              <span
                onClick={() => router.push("/deposit-policy")}
                className="cursor-pointer underline"
              >
                deposit policy
              </span>{" "}
              before you proceed further
            </p>
          </div>

          <div className="mb-5 flex items-center gap-2">
            <input
              id="agree"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="h-4 w-4 cursor-pointer accent-[#111111]"
            />
            <label
              htmlFor="agree"
              className="cursor-pointer text-[13px] text-[#111111]"
            >
              I agree to all the terms and conditions
            </label>
          </div>

          {submitError && (
            <p className="mb-3 text-[13px] text-red-500">{submitError}</p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-xl bg-[#222] px-5 py-3 text-center text-[15px] font-semibold text-white transition hover:brightness-110 disabled:opacity-60 hover:cursor-pointer"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
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
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                {submitLabel}
              </span>
            ) : (
              submitLabel
            )}
          </button>
        </div>

        <div className="mb-10 space-y-3">
          {BOTTOM_STEPS.map((s) => (
            <div key={s.step} className="rounded-2xl bg-[#f0f0f0] px-5 py-4">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d0d0d0] text-sm font-semibold text-[#555]">
                  {s.step}
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-[#111111]">
                    {s.label}
                  </p>
                  <p className="mt-1 text-[14px] text-[#444444]">
                    {s.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
