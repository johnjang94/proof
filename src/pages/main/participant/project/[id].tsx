"use client";

import { useRouter } from "next/router";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { FiChevronRight, FiX } from "react-icons/fi";
import { MdLocalFireDepartment } from "react-icons/md";
import { apiFetch } from "@/lib/apiFetch";

type ParticipantProjectDetail = {
  id: string;
  projectName: string;
  category?: string | null;
  thumbnailUrl?: string | null;
  projectDescription?: string | null;
  aboutClient?: string | null;
  lookingFor?: string | null;
  timeInvestment?: string | null;
  createdAt?: string;
  viewCount?: number;
};

type ParticipantProjectDetailPageProps = {
  isLoggedIn?: boolean;
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

  const now = Date.now();
  const diff = now - created;
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  return diff <= sevenDays;
}

export default function ParticipantProjectDetailPage({
  isLoggedIn = false,
}: ParticipantProjectDetailPageProps) {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState<ParticipantProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!router.isReady || !id || typeof id !== "string") return;

    let mounted = true;

    const loadProject = async () => {
      try {
        setLoading(true);
        setPageError("");

        const res = await apiFetch(`/projects/public/${id}`, {
          method: "GET",
        });

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
          category: item?.category ?? "General",
          thumbnailUrl: item?.thumbnailUrl ?? null,
          projectDescription: item?.projectDescription ?? "",
          aboutClient: item?.aboutClient ?? "",
          lookingFor: item?.lookingFor ?? "TBD",
          timeInvestment: item?.timeInvestment ?? "TBD",
          createdAt: item?.createdAt,
          viewCount: item?.viewCount ?? 0,
        });
      } catch (error) {
        console.error("participant project detail load error:", error);

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

  const bannerUrl = useMemo(() => {
    return project?.thumbnailUrl || FALLBACK_BANNER;
  }, [project?.thumbnailUrl]);

  const popular = useMemo(
    () => isPopularProject(project?.viewCount),
    [project?.viewCount],
  );

  const isNew = useMemo(
    () => !popular && isNewProject(project?.createdAt),
    [popular, project?.createdAt],
  );

  const aboutText = useMemo(() => {
    const intro = project?.aboutClient?.trim() ?? "";
    const desc = project?.projectDescription?.trim() ?? "";

    if (intro && desc) return `${intro}\n\n${desc}`;
    if (intro) return intro;
    if (desc) return desc;

    return "Project details will appear here once the project description is available.";
  }, [project?.aboutClient, project?.projectDescription]);

  const onApply = () => {
    if (!project?.id) return;

    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    router.push(`/main/participant/project/${project.id}/apply`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f4f4] px-4 py-5 md:px-6">
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
      <main className="min-h-screen bg-[#f4f4f4] px-4 py-8 md:px-6">
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
    <>
      <main className="min-h-screen py-5 text-[#111111]">
        <div className="mx-auto px-12">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-medium text-[#111111]">
            <span>DESIGN</span>
            <FiChevronRight className="text-[15px]" />
            <span className="truncate text-[#2a2a2a]">
              {project.category || "General"}
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

          <div className="grid gap-5 md:grid-cols-[1.05fr_1fr] md:items-stretch">
            <section className="rounded-[18px] bg-[#bcbcbc] p-5 md:p-6">
              <h2 className="mb-4 text-[24px] font-medium leading-none md:text-[26px]">
                About the Project
              </h2>

              <div className="whitespace-pre-line text-[17px] leading-[1.42] text-[#1e1e1e] md:text-[18px]">
                {aboutText}
              </div>
            </section>

            <section className="flex min-h-80 flex-col justify-between rounded-[18px] bg-transparent px-1 py-1 md:px-4">
              <div className="space-y-7 pt-1">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[16px] text-[#333333] md:text-[18px]">
                    Looking for
                  </span>
                  <span className="text-right text-[22px] font-medium leading-tight text-[#111111] md:text-[34px]">
                    {project.lookingFor || "TBD"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-[16px] text-[#333333] md:text-[18px]">
                    Required commitment period
                  </span>
                  <span className="text-right text-[22px] font-medium leading-tight text-[#111111] md:text-[34px]">
                    {project.timeInvestment || "TBD"}
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={onApply}
                  className="w-full rounded-xl bg-[#97baf4] px-5 py-3 text-[18px] font-medium text-[#111111] transition hover:brightness-[0.98] active:scale-[0.998] hover:cursor-pointer"
                >
                  Apply to Join
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  Please log in first
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  You need an account to apply to this project.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700"
              >
                <FiX className="text-[18px]" />
              </button>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="rounded-xl bg-black w-full py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                Log in
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowLoginModal(false)}
              className="mt-3 w-full rounded-xl px-4 py-3 text-sm font-medium text-neutral-500 transition hover:bg-neutral-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
