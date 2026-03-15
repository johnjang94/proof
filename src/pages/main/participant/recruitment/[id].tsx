"use client";

import { useRouter } from "next/router";
import { useMemo } from "react";
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

type RoleConfig = {
  label: string;
  interviewDescription: string;
};

const ROLE_CONFIG: Record<string, RoleConfig> = {
  guided: {
    label: "Project Coordinator",
    interviewDescription:
      "As a project coordinator, you will be required to participate in a video interview with the client to discuss your experience and fit to form a team.",
  },
};

const DEFAULT_ROLE_CONFIG: RoleConfig = {
  label: "TBD",
  interviewDescription:
    "Participate in a video interview to discuss your experience and fit for the team.",
};

function getRoleConfig(submissionType?: string | null): RoleConfig {
  if (!submissionType) return DEFAULT_ROLE_CONFIG;
  return ROLE_CONFIG[submissionType] ?? DEFAULT_ROLE_CONFIG;
}

function getSteps(interviewDescription: string) {
  return [
    {
      label: "Submit Application",
      description: "Apply with your resume and cover letter",
    },
    {
      label: "Interview",
      description: interviewDescription,
    },
    {
      label: "Selection",
      description: "Applicants will be notified whether they are chosen",
    },
  ];
}

export default function Recruitment() {
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
  const deadlineDate = useMemo(
    () => formatDeadlineDate(project?.projectDeadline),
    [project?.projectDeadline],
  );
  const roleConfig = useMemo(
    () => getRoleConfig(project?.submissionType),
    [project?.submissionType],
  );
  const steps = useMemo(
    () => getSteps(roleConfig.interviewDescription),
    [roleConfig.interviewDescription],
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

        <p className="mb-6 text-sm text-gray-500">
          About the Project · {getLookingForLabel(project.submissionType)},
          deadline on {deadlineDate}
        </p>

        <h2 className="mb-4 text-[26px] font-semibold text-[#111111]">
          Recruitment Process
        </h2>

        <div className="mb-4 rounded-2xl bg-[#f0f0f0] px-5 py-4">
          <p className="text-[15px] leading-snug text-[#111111]">
            We select talented individuals through a detailed three-step
            recruitment process tailored to find the right colleagues for the
            project
          </p>
        </div>

        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div
              key={step.label}
              className="rounded-2xl bg-[#f0f0f0] px-5 py-4"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500 text-sm font-semibold text-white">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-[#111111]">
                    {step.label}
                  </p>
                  <p className="mt-1 text-[14px] text-[#444444]">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border-b border-gray-300 py-3 text-center text-[17px] font-medium text-[#111111] hover:cursor-pointer"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => router.push(`/main/participant/join/${project.id}`)}
            className="flex-2 rounded-xl bg-[#2e7d32] px-5 py-3 text-center text-[17px] font-semibold text-white transition hover:brightness-95 hover:cursor-pointer"
          >
            I understand
          </button>
        </div>
      </div>
    </main>
  );
}
