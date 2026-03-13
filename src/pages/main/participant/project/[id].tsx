"use client";

import { useRouter } from "next/router";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import { MdLocalFireDepartment } from "react-icons/md";
import { apiFetch } from "@/lib/apiFetch";

type ParticipantProjectDetail = {
  id: string;
  projectName: string;
  thumbnailUrl?: string | null;
  projectDescription?: string | null;
  expectedOutcome?: string | null;
  projectDeadline?: string | null;
  createdAt?: string;
  viewCount?: number;
  submissionType?: string | null;
  companyName?: string | null;
  companyLogoUrl?: string | null;
  serviceDescription?: string | null;
};

const FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1600&auto=format&fit=crop";

function isPopularProject(viewCount?: number) {
  return (viewCount ?? 0) >= 10;
}

function isNewProject(createdAt?: string) {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created <= 7 * 24 * 60 * 60 * 1000;
}

function formatTimeRemaining(deadlineStr?: string | null): string {
  if (!deadlineStr) return "TBD";
  const deadline = new Date(deadlineStr);
  if (Number.isNaN(deadline.getTime())) return "TBD";
  const diffMs = deadline.getTime() - Date.now();
  if (diffMs <= 0) return "Deadline passed";
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths >= 2) return `${diffMonths} months remaining`;
  if (diffWeeks >= 1)
    return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} remaining`;
  return `${diffDays} day${diffDays !== 1 ? "s" : ""} remaining`;
}

function formatDeadlineDate(deadlineStr?: string | null): string {
  if (!deadlineStr) return "TBD";
  const deadline = new Date(deadlineStr);
  if (Number.isNaN(deadline.getTime())) return "TBD";
  return deadline.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ParticipantProjectDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState<ParticipantProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [openKey, setOpenKey] = useState<string>("about");

  const toggle = (key: string) => {
    setOpenKey((prev) => (prev === key ? "" : key));
  };

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
          throw new Error(
            `Failed to load project detail (${res.status}). ${text}`,
          );
        }

        const data = await res.json();
        const item = data?.item ?? data?.project ?? data ?? null;

        if (!mounted) return;

        setProject({
          id: item?.id ?? id,
          projectName: item?.projectName ?? "Untitled Project",
          thumbnailUrl: item?.thumbnailUrl ?? null,
          projectDescription: item?.projectDescription ?? "",
          expectedOutcome: item?.expectedOutcome ?? "",
          projectDeadline: item?.projectDeadline ?? null,
          createdAt: item?.createdAt,
          viewCount: item?.viewCount ?? 0,
          submissionType: item?.submissionType ?? "self-guided",
          companyName: item?.clientUser?.company?.name ?? null,
          companyLogoUrl: item?.clientUser?.company?.logoUrl ?? null,
          serviceDescription:
            item?.clientUser?.company?.serviceDescription ?? null,
        });
      } catch (error) {
        if (!mounted) return;
        setPageError(
          error instanceof Error
            ? error.message
            : "Failed to load project details.",
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
  const timeRemaining = useMemo(
    () => formatTimeRemaining(project?.projectDeadline),
    [project?.projectDeadline],
  );
  const deadlineDate = useMemo(
    () => formatDeadlineDate(project?.projectDeadline),
    [project?.projectDeadline],
  );
  const lookingForLabel = useMemo(
    () =>
      project?.submissionType === "guided" ? "Project Coordinator" : "TBD",
    [project?.submissionType],
  );

  const sections = useMemo(
    () => [
      {
        key: "about",
        title: "About the Project",
        bg: "bg-[#bcbcbc]",
        content:
          project?.projectDescription ||
          "Project details will appear here once available.",
      },
      {
        key: "company",
        title: "About the Company",
        bg: "bg-[#e8e8e8]",
        content:
          project?.serviceDescription ||
          "Company information will appear here once available.",
      },
      {
        key: "outcome",
        title: "Expected Outcome",
        bg: "bg-[#e8e8e8]",
        content:
          project?.expectedOutcome ||
          "Expected outcome will appear here once available.",
      },
    ],
    [project],
  );

  if (loading) {
    return (
      <main className="min-h-screen py-5 md:px-6">
        <div className="mx-auto w-full max-w-6xl animate-pulse">
          <div className="mb-4 h-6 w-56 rounded bg-gray-200" />
          <div className="mb-4 h-70 w-full rounded-2xl bg-gray-200 md:h-105" />
          <div className="mb-4 h-10 w-3/4 rounded bg-gray-200" />
          <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
            <div className="h-80 rounded-2xl bg-gray-200" />
            <div className="h-80 rounded-2xl bg-gray-200" />
          </div>
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
        {/* Breadcrumb */}
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

        {/* Banner */}
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

        {/* Title */}
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

        {/* Top grid: About the Project + Project Info */}
        <div className="grid gap-5 md:grid-cols-[1.05fr_1fr] md:items-stretch">
          {/* Accordion sections */}
          <div className="space-y-3">
            {sections.map(({ key, title, bg, content }) => (
              <section
                key={key}
                className={`overflow-hidden rounded-[18px] ${bg}`}
              >
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  className="flex w-full items-center justify-between px-5 py-5 md:px-6 md:py-6"
                >
                  <h2 className="text-[24px] font-medium leading-none md:text-[26px]">
                    {title}
                  </h2>
                  <svg
                    className={`h-5 w-5 shrink-0 text-[#1e1e1e] transition-transform duration-300 ${
                      openKey === key ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openKey === key
                      ? "max-h-250 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="whitespace-pre-line px-5 pb-5 text-[17px] leading-[1.42] text-[#1e1e1e] md:px-6 md:pb-6 md:text-[18px]">
                    {content}
                  </div>
                </div>
              </section>
            ))}
          </div>

          {/* Project Info */}
          <section className="flex min-h-80 flex-col justify-between rounded-[18px] bg-transparent px-1 py-1 md:px-4">
            <div className="space-y-7 pt-1">
              <div className="flex items-start justify-between gap-4">
                <span className="text-[16px] text-[#333333] md:text-[18px]">
                  Looking for
                </span>
                <span className="text-right text-[22px] font-medium leading-tight text-[#111111] md:text-[28px]">
                  {lookingForLabel}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <span className="text-[16px] text-[#333333] md:text-[18px]">
                  Required commitment period
                </span>
                <span className="text-right text-[18px] font-medium leading-tight text-[#111111] md:text-[22px]">
                  {timeRemaining}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <span className="text-[16px] text-[#333333] md:text-[18px]">
                  Project Deadline
                </span>
                <span className="text-right text-[18px] font-medium leading-tight text-[#111111] md:text-[22px]">
                  {deadlineDate}
                </span>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={() =>
                  router.push(`/main/participant/job-description/${project.id}`)
                }
                className="w-full rounded-xl bg-[#97baf4] px-5 py-3 text-[18px] font-medium text-[#111111] transition hover:brightness-[0.98] active:scale-[0.998] hover:cursor-pointer"
              >
                About the role
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
