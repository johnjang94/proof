"use client";

import { useRouter } from "next/router";
import { useMemo } from "react";
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

export default function Success() {
  const router = useRouter();
  const { id } = router.query;

  const { project, loading, pageError } = useProjectDetail(id, router.isReady);

  const popular = useMemo(
    () => isPopularProject(project?.viewCount),
    [project?.viewCount],
  );
  const isNew = useMemo(
    () => !popular && isNewProject(project?.createdAt),
    [popular, project?.createdAt],
  );

  const waitingMessage =
    project?.submissionType === "guided"
      ? "Hang tight! The client will reach out to you shortly 🛸"
      : "Hang tight! Our team is reviewing your profile 🛸";

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

        <div className="mb-6 rounded-2xl bg-[#f0f0f0] px-5 py-4">
          <div className="mb-5 flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
              1
            </span>
            <p className="text-[15px] font-semibold text-[#111111]">
              Fill out the application
            </p>
          </div>

          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-green-500">
              <svg
                className="h-8 w-8 text-green-500"
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

            <p className="mb-2 text-[18px] font-semibold text-green-600">
              Your application has been successfully submitted
            </p>
            <p className="mb-8 text-[14px] text-[#444444]">{waitingMessage}</p>

            <button
              type="button"
              onClick={() => router.push("/main/participant/landing")}
              className="rounded-xl bg-[#4a90e2] px-10 py-3 text-[15px] font-semibold text-white transition hover:brightness-95 hover:cursor-pointer"
            >
              Home
            </button>
          </div>
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
