"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { FiX, FiArrowLeft, FiCamera, FiEdit2, FiCheck } from "react-icons/fi";

import { supabase } from "@/lib/supabaseInstance";
import { apiFetch } from "@/lib/apiFetch";
import { uploadAsset } from "@/services/upload/uploadAsset";

const EDIT_WINDOW_MS = 15 * 60 * 1000; // 15분

type ProjectDetail = {
  id: string;
  projectName: string;
  budgetAllowance: string;
  projectDeadline: string | null;
  projectDescription: string;
  expectedOutcome: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  createdAt?: string;
  status?: string;
};

type EditForm = {
  projectName: string;
  projectDescription: string;
  expectedOutcome: string;
  projectDeadline: string;
  budgetAllowance: string;
};

function formatStatus(status?: string) {
  if (!status) return "Pending HR Review";
  const normalized = status.trim().toLowerCase();
  if (normalized === "submitted") return "Pending HR Review";
  if (normalized === "under review" || normalized === "under_review")
    return "Pending HR Review";
  if (normalized === "approved") return "Approved";
  if (normalized === "recruiting") return "Recruiting";
  if (normalized === "in progress" || normalized === "in_progress")
    return "In Progress";
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

function formatDeadlineDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatBudget(value?: string) {
  if (!value) return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return `$${num.toLocaleString()}`;
}

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

function formatCountdown(ms: number) {
  if (ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
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

  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState("");
  const thumbInputRef = useRef<HTMLInputElement | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    projectName: "",
    projectDescription: "",
    expectedOutcome: "",
    projectDeadline: "",
    budgetAllowance: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!project?.createdAt) return;

    const tick = () => {
      const created = new Date(project.createdAt!).getTime();
      const elapsed = Date.now() - created;
      const remaining = EDIT_WINDOW_MS - elapsed;
      setRemainingMs(remaining);
      if (remaining <= 0 && isEditing) setIsEditing(false);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [project?.createdAt, isEditing]);

  const canEdit = remainingMs > 0;

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

        const res = await apiFetch(`/project-intakes/${id}`, { method: "GET" });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Failed to load project (${res.status}). ${text}`);
        }

        const json = await res.json();
        if (!json) throw new Error("Project not found.");

        setProject(json);
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

  const handleEditStart = useCallback(() => {
    if (!project || !canEdit) return;
    setEditForm({
      projectName: project.projectName,
      projectDescription: project.projectDescription,
      expectedOutcome: project.expectedOutcome,
      projectDeadline: toDateInputValue(project.projectDeadline),
      budgetAllowance: project.budgetAllowance,
    });
    setSaveError("");
    setIsEditing(true);
  }, [project, canEdit]);

  const handleEditCancel = () => {
    setIsEditing(false);
    setSaveError("");
  };

  const handleEditSave = async () => {
    if (!project) return;

    try {
      setSaving(true);
      setSaveError("");

      const res = await apiFetch(`/project-intakes/${project.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          projectName: editForm.projectName.trim(),
          projectDescription: editForm.projectDescription.trim(),
          expectedOutcome: editForm.expectedOutcome.trim(),
          projectDeadline: editForm.projectDeadline,
          estimatedBudget: Number(editForm.budgetAllowance),
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Failed to save (${res.status}). ${text}`);
      }

      setProject((prev) =>
        prev
          ? {
              ...prev,
              projectName: editForm.projectName.trim(),
              projectDescription: editForm.projectDescription.trim(),
              expectedOutcome: editForm.expectedOutcome.trim(),
              projectDeadline: editForm.projectDeadline
                ? new Date(editForm.projectDeadline).toISOString()
                : null,
              budgetAllowance: editForm.budgetAllowance,
            }
          : prev,
      );

      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setSaveError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleThumbnailChange = async (file?: File) => {
    if (!file || !project) return;
    if (!file.type.startsWith("image/")) {
      setThumbnailError("Only image files allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setThumbnailError("Max 10MB.");
      return;
    }

    try {
      setThumbnailUploading(true);
      setThumbnailError("");

      const url = await uploadAsset(file, "project-thumbnail");

      const res = await apiFetch(`/project-intakes/${project.id}`, {
        method: "PATCH",
        body: JSON.stringify({ thumbnailUrl: url }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Failed to update thumbnail (${res.status}). ${text}`);
      }

      setProject((prev) => (prev ? { ...prev, thumbnailUrl: url } : prev));
    } catch (err) {
      console.error(err);
      setThumbnailError(
        err instanceof Error ? err.message : "Failed to update thumbnail.",
      );
    } finally {
      setThumbnailUploading(false);
      if (thumbInputRef.current) thumbInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!project) return;

    try {
      setDeleting(true);
      setDeleteError("");

      const res = await apiFetch(`/project-intakes/${project.id}`, {
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
              {/* Status */}
              <div className="rounded-md border border-[#e3c46a] bg-[#f4d88b] px-4 py-4 text-[18px] text-[#b46a00] shadow-sm">
                <span className="font-medium">{statusLabel}</span>
              </div>

              {/* Banner */}
              <div className="group relative mt-5 h-80 w-full overflow-hidden rounded-lg border border-gray-300 bg-gray-100">
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

                <button
                  type="button"
                  onClick={() =>
                    !thumbnailUploading && thumbInputRef.current?.click()
                  }
                  disabled={thumbnailUploading}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 transition-all duration-200 group-hover:bg-black/40 disabled:cursor-not-allowed"
                >
                  {thumbnailUploading ? (
                    <>
                      <svg
                        className="h-8 w-8 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-white">
                        Uploading...
                      </span>
                    </>
                  ) : (
                    <span className="flex flex-col items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <FiCamera className="text-[32px] text-white drop-shadow" />
                      <span className="text-sm font-medium text-white drop-shadow">
                        Change Photo
                      </span>
                    </span>
                  )}
                </button>

                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleThumbnailChange(e.target.files?.[0])}
                />
              </div>

              {thumbnailError ? (
                <p className="mt-1.5 text-xs text-red-600">{thumbnailError}</p>
              ) : null}

              {/* Title + Edit 버튼 */}
              <div className="mt-6 flex items-start justify-between gap-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.projectName}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        projectName: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-3xl font-semibold text-black focus:border-gray-400 focus:outline-none"
                  />
                ) : (
                  <h1 className="text-4xl font-semibold leading-tight text-black">
                    {project.projectName}
                  </h1>
                )}

                <div className="flex shrink-0 flex-col items-end gap-1">
                  {canEdit && !isEditing && (
                    <>
                      <button
                        type="button"
                        onClick={handleEditStart}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[14px] font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:cursor-pointer"
                      >
                        <FiEdit2 className="text-[14px]" />
                        Edit
                      </button>
                      <span className="text-[11px] text-gray-400">
                        Available for {formatCountdown(remainingMs)}
                      </span>
                    </>
                  )}

                  {isEditing && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleEditCancel}
                        disabled={saving}
                        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[14px] font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleEditSave}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 rounded-md bg-black px-3 py-1.5 text-[14px] font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                      >
                        <FiCheck className="text-[14px]" />
                        {saving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {saveError ? (
                <p className="mt-2 text-xs text-red-600">{saveError}</p>
              ) : null}

              {/* Meta grid */}
              <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-4">
                <div>
                  <p className="mb-2 text-[20px] font-medium uppercase tracking-wide text-black">
                    Estimated Budget
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      inputMode="numeric"
                      value={editForm.budgetAllowance}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          budgetAllowance: e.target.value.replace(/[^\d]/g, ""),
                        }))
                      }
                      className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-[18px] text-gray-900 focus:border-gray-400 focus:outline-none"
                    />
                  ) : (
                    <div className="rounded-md border border-gray-300 bg-[#efefef] px-4 py-3 text-[18px] text-gray-900">
                      {formatBudget(project.budgetAllowance)}
                    </div>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-[20px] font-medium uppercase tracking-wide text-black">
                    Project Deadline
                  </p>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editForm.projectDeadline}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          projectDeadline: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-[18px] text-gray-900 focus:border-gray-400 focus:outline-none"
                    />
                  ) : (
                    <div className="rounded-md border border-gray-300 bg-[#efefef] px-4 py-3 text-[18px] text-gray-900">
                      {formatDeadlineDate(project.projectDeadline)}
                    </div>
                  )}
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

              {/* Project Description */}
              <div className="mt-6">
                <label className="mb-2 block text-[20px] font-medium text-black">
                  Project Description
                </label>
                {isEditing ? (
                  <textarea
                    rows={5}
                    value={editForm.projectDescription}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        projectDescription: e.target.value,
                      }))
                    }
                    className="w-full resize-none rounded-md border border-gray-300 bg-white px-4 py-3 text-[18px] leading-8 text-gray-900 focus:border-gray-400 focus:outline-none"
                  />
                ) : (
                  <div className="min-h-27.5 rounded-md border border-gray-300 bg-[#efefef] px-4 py-3 text-[18px] leading-8 text-gray-900">
                    {project.projectDescription || "-"}
                  </div>
                )}
              </div>

              {/* Expected Outcome */}
              <div className="mt-5">
                <label className="mb-2 block text-[20px] font-medium text-black">
                  Expected Outcome
                </label>
                {isEditing ? (
                  <textarea
                    rows={4}
                    value={editForm.expectedOutcome}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        expectedOutcome: e.target.value,
                      }))
                    }
                    className="w-full resize-none rounded-md border border-gray-300 bg-white px-4 py-3 text-[18px] leading-8 text-gray-900 focus:border-gray-400 focus:outline-none"
                  />
                ) : (
                  <div className="min-h-18 rounded-md border border-gray-300 bg-[#efefef] px-4 py-3 text-[18px] leading-8 text-gray-900">
                    {project.expectedOutcome || "-"}
                  </div>
                )}
              </div>

              {/* Actions */}
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

      {/* Delete Modal */}
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
