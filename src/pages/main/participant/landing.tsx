"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { apiFetch } from "@/lib/apiFetch";

type AuthUser = {
  id: string;
  email?: string;
} | null;

type Props = {
  authUser: AuthUser;
  role: string | null;
};

type ProjectItem = {
  id: string;
  projectName: string;
  projectDescription: string;
  expectedOutcome: string;
  budgetAllowance: string;
  projectDeadline: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  submissionType: string;
  status: string;
  createdAt?: string;
  clientUser?: {
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    company?: {
      name?: string | null;
      logoUrl?: string | null;
    } | null;
  } | null;
};

function getHostedBy(project: ProjectItem) {
  const companyName = project.clientUser?.company?.name?.trim();
  if (companyName) return companyName;

  const fullName = [project.clientUser?.firstName, project.clientUser?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (fullName) return fullName;

  return "Client";
}

function getHostedByInitial(project: ProjectItem) {
  const hostedBy = getHostedBy(project);
  return hostedBy.charAt(0).toUpperCase() || "C";
}

function formatRelativeTime(createdAt?: string) {
  if (!createdAt) return "";

  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return "";

  const now = Date.now();
  const diffMs = now - created;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diffMs < minute) return "just now";
  if (diffMs < hour) {
    const mins = Math.floor(diffMs / minute);
    return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  }
  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  if (diffMs < week) {
    const days = Math.floor(diffMs / day);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  const weeks = Math.floor(diffMs / week);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;

  return new Date(createdAt).toLocaleDateString();
}

function sortByCreatedAtDesc(items: ProjectItem[]) {
  return [...items].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}

function ProjectCard({
  project,
  onClick,
}: {
  project: ProjectItem;
  onClick: () => void;
}) {
  const hostedBy = getHostedBy(project);
  const thumbnail = project.thumbnailUrl || null;
  const relativeTime = formatRelativeTime(project.createdAt);
  const logoUrl = project.clientUser?.company?.logoUrl;
  const avatarUrl = project.clientUser?.avatarUrl;

  return (
    <article onClick={onClick} className="group cursor-pointer">
      <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-[22px] bg-neutral-200">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={`${project.projectName} thumbnail`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-sm text-neutral-400">
            No thumbnail
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 px-1">
        {logoUrl ? (
          <div className="relative mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <Image
              src={logoUrl}
              alt={`${hostedBy} logo`}
              fill
              sizes="36px"
              className="object-cover"
              unoptimized
            />
          </div>
        ) : avatarUrl ? (
          <div className="relative mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-white">
            <Image
              src={avatarUrl}
              alt={`${hostedBy} avatar`}
              fill
              sizes="36px"
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-xs font-semibold text-neutral-600">
            {getHostedByInitial(project)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-2 text-[1.03rem] font-medium leading-tight tracking-[-0.01em] text-neutral-900">
            {project.projectName}
          </h2>

          <div className="mt-2 flex min-w-0 items-center gap-2 text-[13px] text-neutral-500">
            <span className="truncate">{hostedBy}</span>
          </div>

          <div className="mt-1 flex items-center gap-2 text-[12px] text-neutral-400">
            {relativeTime ? <span>{relativeTime}</span> : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Home({ role }: Props) {
  const router = useRouter();

  const [publicProjects, setPublicProjects] = useState<ProjectItem[]>([]);
  const [loadingPublic, setLoadingPublic] = useState(true);
  const [publicError, setPublicError] = useState("");

  const [appliedProjects, setAppliedProjects] = useState<ProjectItem[]>([]);
  const [loadingApplied, setLoadingApplied] = useState(false);

  const isParticipant = role === "participant";

  useEffect(() => {
    const loadPublicProjects = async () => {
      try {
        setLoadingPublic(true);
        setPublicError("");

        const res = await apiFetch("/projects/public", { method: "GET" });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(
            `Failed to load public projects (${res.status}). ${text}`,
          );
        }

        const json = await res.json();
        const items: ProjectItem[] = Array.isArray(json?.items)
          ? json.items
          : Array.isArray(json)
            ? json
            : [];

        setPublicProjects(items);
      } catch (err) {
        console.error(err);
        setPublicError(
          err instanceof Error
            ? err.message
            : "Failed to load public projects.",
        );
      } finally {
        setLoadingPublic(false);
      }
    };

    void loadPublicProjects();
  }, []);

  useEffect(() => {
    if (!isParticipant) return;

    const loadAppliedProjects = async () => {
      try {
        setLoadingApplied(true);
        const res = await apiFetch("/project-applications/mine", {
          method: "GET",
        });
        if (!res.ok) return;
        const json = await res.json();
        const items: ProjectItem[] = Array.isArray(json) ? json : [];
        setAppliedProjects(items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingApplied(false);
      }
    };

    void loadAppliedProjects();
  }, [isParticipant]);

  const appliedIds = useMemo(
    () => new Set(appliedProjects.map((p) => p.id)),
    [appliedProjects],
  );

  const unappliedProjects = useMemo(
    () =>
      sortByCreatedAtDesc(publicProjects.filter((p) => !appliedIds.has(p.id))),
    [publicProjects, appliedIds],
  );

  const sortedApplied = useMemo(
    () => sortByCreatedAtDesc(appliedProjects),
    [appliedProjects],
  );

  const allProjects = useMemo(
    () => sortByCreatedAtDesc(publicProjects),
    [publicProjects],
  );

  const goToProjectDetail = (projectId: string) => {
    void router.push(`/main/participant/project/${projectId}`);
  };

  return (
    <main className="mx-auto w-full max-w-350 px-4 pb-16 md:px-6 lg:px-8">
      <section className="mb-8 pt-2 text-center">
        <h1 className="text-2xl italic font-medium tracking-[-0.02em] text-neutral-900 md:text-[2.1rem]">
          Build proof through practical projects
        </h1>
      </section>

      {loadingPublic ? (
        <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-6 text-sm text-neutral-600 shadow-sm">
          Loading projects...
        </div>
      ) : publicError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-700 shadow-sm">
          {publicError}
        </div>
      ) : (
        <>
          {isParticipant && sortedApplied.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-4 text-base font-semibold text-neutral-900">
                Recently Applied
              </h2>
              {loadingApplied ? (
                <div className="text-sm text-neutral-500">Loading...</div>
              ) : (
                <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                  {sortedApplied.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onClick={() => goToProjectDetail(project.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          <section>
            {isParticipant &&
              sortedApplied.length > 0 &&
              unappliedProjects.length > 0 && (
                <h2 className="mb-4 text-base font-semibold text-neutral-900">
                  All Projects
                </h2>
              )}

            {(isParticipant ? unappliedProjects : allProjects).length === 0 ? (
              <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-6 text-sm text-neutral-600 shadow-sm">
                No projects available yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                {(isParticipant ? unappliedProjects : allProjects).map(
                  (project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onClick={() => goToProjectDetail(project.id)}
                    />
                  ),
                )}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
