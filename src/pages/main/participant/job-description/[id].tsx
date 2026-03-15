"use client";

import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import { apiFetch } from "@/lib/apiFetch";
import { useProjectDetail } from "@/hooks/useProjectDetail";
import {
  isPopularProject,
  isNewProject,
  formatDeadlineDate,
  getLookingForLabel,
} from "@/lib/projectUtils";

import type { ProjectDetail } from "@/types/project";
import {
  ProjectBanner,
  ProjectBreadcrumb,
  ProjectErrorState,
  ProjectLoadingSkeleton,
  ProjectTitle,
} from "@/components/project/prject-shared";

type Props = {
  role?: string | null;
};

function buildAboutRole(project: ProjectDetail): string {
  if (project.submissionType === "guided") {
    return `As a Project Coordinator for ${project.companyName ?? "this company"}, you will be responsible for managing and overseeing the execution of ${project.projectName ?? "this project"}. You will serve as the primary point of contact between the client and the project team, ensuring that deliverables are met on time and to the expected standard.\n\nThe ideal candidate is highly organized, communicative, and comfortable working in a fast-paced environment. You will be expected to track progress, facilitate communication, and help the team navigate any challenges that arise throughout the project lifecycle.`;
  }
  return "This is where the role description goes.";
}

export default function JobDescription({ role }: Props) {
  const router = useRouter();
  const { id } = router.query;

  const { project, loading, pageError } = useProjectDetail(id, router.isReady);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (role !== "participant" || !id || typeof id !== "string") return;

    let mounted = true;

    const checkApplied = async () => {
      try {
        const res = await apiFetch("/project-applications/mine", {
          method: "GET",
        });
        if (!res.ok) return;
        const json = await res.json();
        const items: { id: string }[] = Array.isArray(json) ? json : [];
        if (mounted) setHasApplied(items.some((p) => p.id === id));
      } catch {}
    };

    void checkApplied();
    return () => {
      mounted = false;
    };
  }, [role, id]);

  const popular = useMemo(
    () => isPopularProject(project?.viewCount),
    [project?.viewCount],
  );
  const isNew = useMemo(
    () => !popular && isNewProject(project?.createdAt),
    [popular, project?.createdAt],
  );
  const deadlineDate = useMemo(
    () => formatDeadlineDate(project?.projectDeadline),
    [project?.projectDeadline],
  );
  const lookingForLabel = useMemo(
    () => getLookingForLabel(project?.submissionType),
    [project?.submissionType],
  );
  const aboutRole = useMemo(
    () => (project ? buildAboutRole(project) : ""),
    [project],
  );

  const onApply = () => {
    if (!project?.id) return;
    if (!role || role !== "participant") {
      setShowLoginModal(true);
      return;
    }
    router.push(`/main/participant/recruitment/${project.id}`);
  };

  if (loading) return <ProjectLoadingSkeleton />;
  if (pageError || !project)
    return (
      <ProjectErrorState message={pageError} onBack={() => router.back()} />
    );

  return (
    <>
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

          <div className="grid gap-5 md:grid-cols-[1.05fr_1fr] md:items-stretch">
            <section className="rounded-[18px] bg-[#bcbcbc] p-5 md:p-6">
              <h2 className="mb-4 text-[24px] font-medium leading-none md:text-[26px]">
                About the Role
              </h2>
              <div className="whitespace-pre-line text-[17px] leading-[1.42] text-[#1e1e1e] md:text-[18px]">
                {aboutRole}
              </div>
            </section>

            <section className="flex min-h-80 flex-col justify-between rounded-[18px] bg-transparent px-1 py-1 md:px-4">
              <div className="space-y-7 pt-1">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[16px] text-[#333333] md:text-[18px]">
                    {hasApplied ? "Applied as" : "Looking for"}
                  </span>
                  <span className="text-right text-[22px] font-medium leading-tight text-[#111111] md:text-[28px]">
                    {lookingForLabel}
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
                {hasApplied ? (
                  <div className="w-full rounded-xl bg-[#f0f0f0] px-5 py-3 text-center text-[18px] font-medium text-[#888888]">
                    Under Review
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onApply}
                    className="w-full rounded-xl bg-[#97baf4] px-5 py-3 text-[18px] font-medium text-[#111111] transition hover:brightness-[0.98] active:scale-[0.998] hover:cursor-pointer"
                  >
                    Apply to Join
                  </button>
                )}
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
                className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700 hover:cursor-pointer"
              >
                <FiX className="text-[18px]" />
              </button>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="rounded-xl bg-black w-full py-3 text-sm font-medium text-white transition hover:opacity-90 hover:cursor-pointer"
              >
                Log in
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowLoginModal(false)}
              className="mt-3 w-full rounded-xl px-4 py-3 text-sm font-medium text-neutral-500 transition hover:bg-neutral-100 hover:cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
