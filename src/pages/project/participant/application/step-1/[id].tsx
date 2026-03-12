"use client";

import { useRouter } from "next/router";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronRight, FiUpload } from "react-icons/fi";
import { MdLocalFireDepartment } from "react-icons/md";
import { apiFetch } from "@/lib/apiFetch";

type ProjectDetail = {
  id: string;
  projectName: string;
  thumbnailUrl?: string | null;
  createdAt?: string;
  viewCount?: number;
  companyName?: string | null;
  companyLogoUrl?: string | null;
  position?: string | null;
};

const FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1600&auto=format&fit=crop";

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

function isPopularProject(viewCount?: number) {
  return (viewCount ?? 0) >= 10;
}

function isNewProject(createdAt?: string) {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created <= 7 * 24 * 60 * 60 * 1000;
}

function getMimeType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "doc") return "application/msword";
  if (ext === "docx")
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return file.type;
}

export default function FirstStep() {
  const router = useRouter();
  const { id } = router.query;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [portfolioLink, setPortfolioLink] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!router.isReady || !id || typeof id !== "string") return;

    let mounted = true;

    const loadProject = async () => {
      try {
        setLoading(true);
        setPageError("");

        const res = await apiFetch(`/projects/public/${id}`, { method: "GET" });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Failed to load project (${res.status}). ${text}`);
        }

        const data = await res.json();
        const item = data?.item ?? data?.project ?? data ?? null;

        if (!mounted) return;

        setProject({
          id: item?.id ?? id,
          projectName: item?.projectName ?? "Untitled Project",
          thumbnailUrl: item?.thumbnailUrl ?? null,
          createdAt: item?.createdAt,
          viewCount: item?.viewCount ?? 0,
          companyName: item?.clientUser?.company?.name ?? null,
          companyLogoUrl: item?.clientUser?.company?.logoUrl ?? null,
          position: item?.position ?? null,
        });
      } catch (error) {
        if (!mounted) return;
        setPageError(
          error instanceof Error ? error.message : "Failed to load project.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProject();
    return () => {
      mounted = false;
    };
  }, [router.isReady, id]);

  const bannerUrl = useMemo(
    () => project?.thumbnailUrl || FALLBACK_BANNER,
    [project?.thumbnailUrl],
  );
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

      const mimeType = getMimeType(resumeFile);

      const presignRes = await apiFetch("/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "resume",
          filename: resumeFile.name,
          contentType: mimeType,
        }),
      });

      if (!presignRes.ok) {
        throw new Error("Failed to get upload URL.");
      }

      const { uploadUrl, key } = await presignRes.json();

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": mimeType },
        body: resumeFile,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload resume.");
      }

      const applyRes = await apiFetch("/project-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          resumeR2Key: key,
          ...(portfolioLink.trim() && { portfolioLink: portfolioLink.trim() }),
        }),
      });

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
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen py-5 md:px-6">
        <div className="mx-auto w-full max-w-6xl animate-pulse">
          <div className="mb-4 h-6 w-56 rounded bg-gray-200" />
          <div className="mb-4 h-70 w-full rounded-2xl bg-gray-200 md:h-105" />
          <div className="mb-4 h-10 w-3/4 rounded bg-gray-200" />
          <div className="h-80 rounded-2xl bg-gray-200" />
        </div>
      </main>
    );
  }

  if (pageError || !project) {
    return (
      <main className="min-h-screen py-8 md:px-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <p className="text-base font-medium text-red-600">
            {pageError || "Project not found."}
          </p>
          <button
            type="button"
            onClick={() => router.back()}
            className="mt-4 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Go back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-5 text-[#111111]">
      <div className="mx-auto md:px-12 px-5">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-medium text-[#111111]">
          <span>DESIGN</span>
          <FiChevronRight className="text-[15px]" />
          <span className="inline-flex items-center gap-2 text-[#2a2a2a]">
            {project.companyLogoUrl && (
              <Image
                src={project.companyLogoUrl}
                alt={project.companyName ?? "Company logo"}
                width={20}
                height={20}
                className="rounded-sm object-cover"
                unoptimized
              />
            )}
            <span className="truncate">{project.companyName ?? "General"}</span>
          </span>
        </div>

        <div className="relative mb-4 overflow-hidden rounded-[20px] bg-[#d9d9d9]">
          <div className="relative h-65 w-full md:h-107.5">
            <Image
              src={bannerUrl}
              alt={project.projectName}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        </div>

        <div className="mb-5 flex items-center gap-3">
          {isNew && (
            <span className="inline-flex items-center rounded-md bg-[#bfe0ff] px-3 py-1 text-sm font-medium text-[#0f2942]">
              New
            </span>
          )}
          <h1 className="text-2xl font-medium leading-tight tracking-[-0.02em] md:text-4xl">
            {project.projectName}
          </h1>
          {popular && (
            <MdLocalFireDepartment className="text-[28px] text-red-500 md:text-[34px]" />
          )}
        </div>

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

          <div className="mb-4">
            <label className="mb-1 block text-[13px] text-[#111111]">
              Resume / CV
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex min-h-45 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-6 text-center transition ${
                isDragging
                  ? "border-gray-400 bg-gray-100"
                  : "border-gray-300 bg-white"
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
                <p className="text-[14px] font-medium text-[#111111]">
                  {resumeFile.name}
                </p>
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
            {submitting ? "Submitting..." : "Submit Application ➤"}
          </button>
        </div>

        <div className="space-y-3 mb-10">
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
