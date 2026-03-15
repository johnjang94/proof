"use client";

import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { useProjectDetail } from "@/hooks/useProjectDetail";
import {
  isPopularProject,
  isNewProject,
  formatDeadlineDate,
  getLookingForLabel,
} from "@/lib/projectUtils";
import {
  ProjectBanner,
  ProjectBreadcrumb,
  ProjectErrorState,
  ProjectLoadingSkeleton,
  ProjectTitle,
} from "@/components/project/prject-shared";

export default function ParticipantProjectDetail() {
  const router = useRouter();
  const { id } = router.query;

  const { project, loading, pageError } = useProjectDetail(id, router.isReady);
  const [openKey, setOpenKey] = useState<string>("about");

  const toggle = (key: string) =>
    setOpenKey((prev) => (prev === key ? "" : key));

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

  const sections = useMemo(
    () => [
      {
        key: "about",
        title: "About the Project",
        content:
          project?.projectDescription ||
          "Project details will appear here once available.",
      },
      {
        key: "company",
        title: "About the Company",
        content:
          project?.serviceDescription ||
          "Company information will appear here once available.",
      },
      {
        key: "outcome",
        title: "Expected Outcome",
        content:
          project?.expectedOutcome ||
          "Expected outcome will appear here once available.",
      },
    ],
    [project],
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

        <div className="grid gap-5 md:grid-cols-[1.05fr_1fr] md:items-stretch">
          <div className="space-y-3">
            {sections.map(({ key, title, content }) => (
              <section
                key={key}
                className={`overflow-hidden rounded-[18px] transition-colors duration-300 ${
                  openKey === key ? "bg-[#bcbcbc]" : "bg-[#e8e8e8]"
                }`}
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
