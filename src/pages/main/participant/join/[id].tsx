"use client";

import { useRouter } from "next/router";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { FiChevronRight } from "react-icons/fi";
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
};

const FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1600&auto=format&fit=crop";

const BENEFITS = [
  "point rewards",
  "networking opportunities",
  "mentorship & guidance",
  "reference letter",
  "exclusive completion badge",
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

export default function Join() {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

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

  if (loading) {
    return (
      <main className="min-h-screen py-5 md:px-6">
        <div className="mx-auto w-full max-w-6xl animate-pulse">
          <div className="mb-4 h-6 w-56 rounded bg-gray-200" />
          <div className="mb-4 h-70 w-full rounded-2xl bg-gray-200 md:h-105" />
          <div className="mb-4 h-10 w-3/4 rounded bg-gray-200" />
          <div className="h-40 rounded-2xl bg-gray-200" />
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

        <div className="mb-8 flex items-center gap-3">
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

        <div className="flex flex-col items-center text-center">
          <h2 className="mb-2 text-[26px] font-semibold text-[#111111]">
            Let&apos;s get started
          </h2>
          <p className="mb-4 text-[15px] text-[#444444]">
            Complete the project to receive:
          </p>
          <ul className="mb-10 space-y-1 text-left text-[15px] text-[#111111]">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <span className="text-[#111111]">•</span>
                {benefit}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() =>
              router.push(`/project/participant/application/step-1/${id}`)
            }
            className="mb-3 w-full rounded-xl bg-[#b3e5fc] px-5 py-4 text-center text-[17px] font-semibold text-[#111111] transition hover:brightness-95 hover:cursor-pointer"
          >
            Join the project 🚀
          </button>
          <p className="text-[13px] font-medium text-[#111111]">
            * Pay your deposit after you are selected
          </p>
        </div>
      </div>
    </main>
  );
}
