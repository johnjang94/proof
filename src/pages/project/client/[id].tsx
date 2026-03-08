"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { FiEdit2, FiX, FiArrowLeft } from "react-icons/fi";

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

type EditForm = {
  projectName: string;
  budgetRange: string;
  timeInvestment: string;
  projectDescription: string;
  goals: string;
  thumbnailUrl: string;
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

function toEditForm(project: ProjectDetail): EditForm {
  return {
    projectName: project.projectName || "",
    budgetRange: project.budgetRange || "",
    timeInvestment: project.timeInvestment || "",
    projectDescription: project.projectDescription || "",
    goals: project.goals || "",
    thumbnailUrl: project.thumbnailUrl || "",
  };
}

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  const [form, setForm] = useState<EditForm>({
    projectName: "",
    budgetRange: "",
    timeInvestment: "",
    projectDescription: "",
    goals: "",
    thumbnailUrl: "",
  });

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

        const res = await apiFetch("/my/project-intakes", {
          method: "GET",
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Failed to load project (${res.status}). ${text}`);
        }

        const json = await res.json();
        const items: ProjectDetail[] = Array.isArray(json?.items)
          ? json.items
          : [];

        const found = items.find((item) => item.id === id);

        if (!found) {
          throw new Error("Project not found.");
        }

        setProject(found);
        setForm(toEditForm(found));
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
  }, [router, id]);

  const statusLabel = useMemo(
    () => formatStatus(project?.status),
    [project?.status],
  );

  const canEdit =
    statusLabel === "Pending HR Review" || statusLabel === "Recruiting";

  const handleChange = (key: keyof EditForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleStartEdit = () => {
    if (!project) return;
    setSaveError("");
    setForm(toEditForm(project));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (!project) return;
    setSaveError("");
    setForm(toEditForm(project));
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!project) return;

    try {
      setSaving(true);
      setSaveError("");

      const payload = {
        projectName: form.projectName.trim(),
        budgetRange: form.budgetRange.trim(),
        timeInvestment: form.timeInvestment.trim(),
        projectDescription: form.projectDescription.trim(),
        goals: form.goals.trim(),
        thumbnailUrl: form.thumbnailUrl.trim() || null,
      };

      const res = await apiFetch(`/my/project-intakes/${project.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Failed to update project (${res.status}). ${text}`);
      }

      const json = await res.json().catch(() => null);
      const updated: ProjectDetail = json?.item ??
        json?.project ?? { ...project, ...payload };

      setProject((prev) =>
        prev
          ? {
              ...prev,
              ...updated,
              projectName: payload.projectName,
              budgetRange: payload.budgetRange,
              timeInvestment: payload.timeInvestment,
              projectDescription: payload.projectDescription,
              goals: payload.goals,
              thumbnailUrl: payload.thumbnailUrl,
            }
          : prev,
      );

      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setSaveError(
        err instanceof Error ? err.message : "Failed to save changes.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleWithdraw = async () => {
    if (!project) return;

    try {
      setWithdrawing(true);
      setWithdrawError("");

      const res = await apiFetch(`/my/project-intakes/${project.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Failed to withdraw project (${res.status}). ${text}`);
      }

      setShowWithdrawModal(false);
      router.push("/main/client/landing");
    } catch (err) {
      console.error(err);
      setWithdrawError(
        err instanceof Error ? err.message : "Failed to withdraw request.",
      );
    } finally {
      setWithdrawing(false);
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
                {canEdit ? " - You may edit before it gets approved" : null}
              </div>

              <div className="relative mt-5 h-80 w-full overflow-hidden rounded-lg border border-gray-300 bg-gray-100">
                {(isEditing ? form.thumbnailUrl : project.thumbnailUrl) ? (
                  <Image
                    src={
                      isEditing
                        ? form.thumbnailUrl
                        : (project.thumbnailUrl as string)
                    }
                    alt={isEditing ? form.projectName : project.projectName}
                    fill
                    sizes="100vw"
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
                  {isEditing ? (
                    <>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={form.projectName}
                        onChange={(e) =>
                          handleChange("projectName", e.target.value)
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-4xl font-semibold leading-tight text-black outline-none transition focus:border-black"
                      />
                    </>
                  ) : (
                    <h1 className="text-4xl font-semibold leading-tight text-black">
                      {project.projectName}
                    </h1>
                  )}
                </div>

                {!isEditing && (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    disabled={!canEdit}
                    className="inline-flex w-48 items-center gap-2 self-start rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-900 shadow-sm transition hover:cursor-pointer hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 md:self-end"
                  >
                    <FiEdit2 className="text-[18px]" />
                    Edit submission
                  </button>
                )}
              </div>

              {saveError ? (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {saveError}
                </div>
              ) : null}

              <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-4">
                <div>
                  <p className="mb-2 text-[20px] font-medium uppercase tracking-wide text-black">
                    Budget Range
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={form.budgetRange}
                      onChange={(e) =>
                        handleChange("budgetRange", e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-[18px] text-gray-900 outline-none transition focus:border-black"
                    />
                  ) : (
                    <div className="rounded-md border border-gray-300 bg-[#efefef] px-4 py-3 text-[18px] text-gray-900">
                      {project.budgetRange || "-"}
                    </div>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-[20px] font-medium uppercase tracking-wide text-black">
                    Timeline
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={form.timeInvestment}
                      onChange={(e) =>
                        handleChange("timeInvestment", e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-[18px] text-gray-900 outline-none transition focus:border-black"
                    />
                  ) : (
                    <div className="rounded-md border border-gray-300 bg-[#efefef] px-4 py-3 text-[18px] text-gray-900">
                      {project.timeInvestment || "-"}
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

              <div className="mt-6">
                <label className="mb-2 block text-[20px] font-medium text-black">
                  Project Description
                </label>
                {isEditing ? (
                  <textarea
                    value={form.projectDescription}
                    onChange={(e) =>
                      handleChange("projectDescription", e.target.value)
                    }
                    rows={7}
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-[18px] leading-8 text-gray-900 outline-none transition focus:border-black"
                  />
                ) : (
                  <div className="min-h-27.5 rounded-md border border-gray-300 bg-[#efefef] px-4 py-3 text-[18px] leading-8 text-gray-900">
                    {project.projectDescription || "-"}
                  </div>
                )}
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-[20px] font-medium text-black">
                  What is your goal for this project?
                </label>
                {isEditing ? (
                  <textarea
                    value={form.goals}
                    onChange={(e) => handleChange("goals", e.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-[18px] leading-8 text-gray-900 outline-none transition focus:border-black"
                  />
                ) : (
                  <div className="min-h-18 rounded-md border border-gray-300 bg-[#efefef] px-4 py-3 text-[18px] leading-8 text-gray-900">
                    {project.goals || "-"}
                  </div>
                )}
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-[18px] font-medium text-black">
                  Project Thumbnail
                </label>

                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={form.thumbnailUrl}
                      onChange={(e) =>
                        handleChange("thumbnailUrl", e.target.value)
                      }
                      placeholder="Paste thumbnail URL"
                      className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-[16px] text-gray-900 outline-none transition focus:border-black"
                    />

                    <div className="relative h-45 w-full overflow-hidden rounded-md border border-gray-300 bg-white md:h-55">
                      {form.thumbnailUrl ? (
                        <Image
                          src={form.thumbnailUrl}
                          alt={`${form.projectName} thumbnail`}
                          fill
                          sizes="100vw"
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
                ) : (
                  <div className="relative h-45 w-full overflow-hidden rounded-md border border-gray-300 bg-white md:h-55">
                    {project.thumbnailUrl ? (
                      <Image
                        src={project.thumbnailUrl}
                        alt={`${project.projectName} thumbnail`}
                        fill
                        sizes="100vw"
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
                )}
              </div>

              <div className="mt-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-[16px] font-medium text-gray-900 shadow-sm transition hover:cursor-pointer hover:bg-gray-50 disabled:opacity-60"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-md border border-black bg-black px-4 py-2 text-[16px] font-medium text-white shadow-sm transition hover:cursor-pointer hover:opacity-90 disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                  </>
                ) : (
                  <>
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
                        setWithdrawError("");
                        setShowWithdrawModal(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-md border border-red-500 bg-white px-4 py-2 text-[16px] font-medium text-red-600 shadow-sm transition hover:cursor-pointer hover:bg-red-50"
                    >
                      <FiX className="text-[18px]" />
                      Withdraw request
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showWithdrawModal ? (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold text-black">
              Withdraw this request?
            </h2>

            <p className="mt-3 text-[16px] leading-7 text-gray-600">
              This project request will be removed. This action cannot be
              undone.
            </p>

            {withdrawError ? (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {withdrawError}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  if (withdrawing) return;
                  setShowWithdrawModal(false);
                }}
                disabled={withdrawing}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-[15px] font-medium text-gray-900 transition hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="cursor-pointer rounded-md border border-red-600 bg-red-600 px-4 py-2 text-[15px] font-medium text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {withdrawing ? "Withdrawing..." : "Yes, withdraw"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
