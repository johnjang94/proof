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

const BENEFITS = [
  "point rewards",
  "networking opportunities",
  "mentorship & guidance",
  "reference letter",
  "exclusive completion badge",
];

export default function Join() {
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
