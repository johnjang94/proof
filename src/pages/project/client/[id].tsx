"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { FiX, FiArrowLeft } from "react-icons/fi";

import { supabase } from "@/lib/supabaseInstance";
import { apiFetch } from "@/lib/apiFetch";

type ProjectDetail = {
  id: string;
  projectName: string;
  budgetRange: string;
  timeInvestment: string;
  projectDescription: string;
  goals: string;
  thumbnailUrl: string | null;
  mp4Url: string | null;
  createdAt?: string;
  status?: string;
};

function formatStatus(status?: string) {
  if (!status) return "Pending HR Review";

  const normalized = status.trim().toLowerCase();

  if (normalized === "submitted") return "Pending HR Review";
  if (normalized === "under review" || normalized === "under_review") {
    return "Pending HR Review";
  }
  if (normalized === "approved") return "Approved";
  if (normalized === "recruiting") return "Recruiting";
  if (normalized === "in progress" || normalized === "in_progress") {
    return "In Progress";
  }

  return "Pending HR Review";
}

function formatSubmittedDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!router.isReady || typeof id !== "string") return;

    const bootstrap = async () => {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/login");
          return;
        }

        const res = await apiFetch(`/project-intakes/${id}`, {
          method: "GET",
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Failed to load project (${res.status}). ${text}`);
        }

        const json = await res.json();
        const intake: ProjectDetail | null = json ?? null;

        if (!intake) {
          throw new Error("Project not found.");
        }

        setProject(intake);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Failed to load project.",
        );
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [router.isReady, id, router]);

  const statusLabel = useMemo(
    () => formatStatus(project?.status),
    [project?.status],
  );

  const handleDelete = async () => {
    const currentProject = project;
    if (!currentProject) return;

    try {
      setDeleting(true);
      setDeleteError("");

      const res = await apiFetch(`/project-intakes/${currentProject.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Failed to delete project (${res.status}). ${text}`);
      }

      setShowDeleteModal(false);
      router.push("/main/client/landing");
    } catch (err) {
      console.error(err);
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete project.",
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-gray-200 px-6 py-5 text-sm text-gray-600">
            Loading project...
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
            {error || "Project not found."}
          </div>

          <button
            type="button"
            onClick={() => router.push("/main/client/landing")}
            className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen px-2 py-2 md:px-4 md:py-4">
        <div className="mx-auto">
          <div className="overflow-hidden rounded-xl">
            <div>
              <div className="rounded-md border border-[#e3c46a] bg-[#f4d88b] px-4 py-4 text-[18px] text-[#b46a00] shadow-sm">
                <span className="font-medium">{statusLabel}</span>
              </div>

              <div className="relative mt-5 h-80 w-full overflow-hidden rounded-lg border border-gray-300 bg-gray-100">
                {project.thumbnailUrl ? (
                  <Image
                    src={project.thumbnailUrl}
                    alt={project.projectName}
                    fill
                    sizes="(max-width: 768px) 100vw, 1200px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                    No thumbnail
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="w-full">
                  <h1 className="text-4xl font-semibold leading-tight text-black">
                    {project.projectName}
                  </h1>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-4">
                <div>
                  <p className="mb-2 text-[20px] font-medium uppercase tracking-wide text-black">
                    Budget Range
                  </p>
                  <div className="rounded-md border border-gray-300 bg-[#efefef] px-4 py-3 text-[18px] text-gray-900">
                    {project.budgetRange || "-"}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[20px] font-medium uppercase tracking-wide text-black">
                    Timeline
                  </p>
                  <div className="rounded-md border border-gray-300 bg-[#efefef] px-4 py-3 text-[18px] text-gray-900">
                    {project.timeInvestment || "-"}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[20px] font-medium uppercase tracking-wide text-black">
                    Submitted
                  </p>
                  <div className="rounded-md border border-gray-300 bg-[#efefef] px-4 py-3 text-[18px] text-gray-900">
                    {formatSubmittedDate(project.createdAt)}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-[20px] font-medium text-black">
                  Project Description
                </label>
                <div className="min-h-27.5 rounded-md border border-gray-300 bg-[#efefef] px-4 py-3 text-[18px] leading-8 text-gray-900">
                  {project.projectDescription || "-"}
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-[20px] font-medium text-black">
                  What is your goal for this project?
                </label>
                <div className="min-h-18 rounded-md border border-gray-300 bg-[#efefef] px-4 py-3 text-[18px] leading-8 text-gray-900">
                  {project.goals || "-"}
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-[18px] font-medium text-black">
                  Thumbnail
                </label>

                <div className="relative h-45 w-full overflow-hidden rounded-md border border-gray-300 bg-white md:h-55">
                  {project.thumbnailUrl ? (
                    <Image
                      src={project.thumbnailUrl}
                      alt={`${project.projectName} thumbnail`}
                      fill
                      sizes="(max-width: 768px) 100vw, 768px"
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-center text-gray-500">
                      <p className="text-lg font-medium">
                        No thumbnail uploaded
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <button
                  type="button"
                  onClick={() => router.push("/main/client/landing")}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-[16px] font-medium text-gray-900 shadow-sm transition hover:cursor-pointer hover:bg-gray-50"
                >
                  <FiArrowLeft className="text-[18px]" />
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeleteError("");
                    setShowDeleteModal(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-md border border-red-500 bg-white px-4 py-2 text-[16px] font-medium text-red-600 shadow-sm transition hover:cursor-pointer hover:bg-red-50"
                >
                  <FiX className="text-[18px]" />
                  Delete project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold text-black">
              Delete this project?
            </h2>

            <p className="mt-3 text-[16px] leading-7 text-gray-600">
              This project will be removed. This action cannot be undone.
            </p>

            {deleteError ? (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {deleteError}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  if (deleting) return;
                  setShowDeleteModal(false);
                }}
                disabled={deleting}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-[15px] font-medium text-gray-900 transition hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="cursor-pointer rounded-md border border-red-600 bg-red-600 px-4 py-2 text-[15px] font-medium text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
