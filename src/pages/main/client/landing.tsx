"use client";

import { supabase } from "@/lib/supabaseInstance";
import { apiFetch } from "@/lib/apiFetch";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FiPlus } from "react-icons/fi";
import Image from "next/image";

type ProjectCard = {
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

const STATUS_STEPS = [
  "Submitted",
  "Under review",
  "Approved",
  "Recruiting",
  "In Progress",
] as const;

function getStatusIndex(status?: string) {
  if (!status) return 0;

  const normalized = status.trim().toLowerCase();

  if (normalized === "submitted") return 0;
  if (normalized === "under review" || normalized === "under_review") return 1;
  if (normalized === "approved") return 2;
  if (normalized === "recruiting") return 3;
  if (normalized === "in progress" || normalized === "in_progress") return 4;

  return 0;
}

export default function Main() {
  const router = useRouter();

  const [firstName, setFirstName] = useState<string>("");
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectError, setProjectError] = useState<string>("");

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoadingProjects(false);
          return;
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("id", user.id)
          .single();

        if (profileData?.first_name) {
          setFirstName(profileData.first_name);
        }

        const res = await apiFetch("/project-intakes", {
          method: "GET",
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Failed to load projects (${res.status}). ${text}`);
        }

        const json = await res.json();
        console.log("project-intakes response:", json);

        const nextProjects: ProjectCard[] = Array.isArray(json) ? json : [];

        setProjects(nextProjects);
      } catch (error) {
        console.error(error);
        setProjectError(
          error instanceof Error ? error.message : "Failed to load projects.",
        );
      } finally {
        setLoadingProjects(false);
      }
    };

    bootstrap();
  }, []);

  const createdJustNow = router.query.created === "1";

  return (
    <div className="min-h-screen">
      <div className="mx-auto px-20 py-14">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-black">
              Welcome {firstName}
              {firstName ? "," : ""}
            </h1>
            <p className="text-lg text-gray-600">
              Let&apos;s get started on a project
            </p>
          </div>

          <button
            onClick={() => router.push("/project/client/project-setup")}
            className="flex items-center gap-2 rounded-lg bg-gray-200 px-6 py-3 text-base text-gray-800 hover:bg-gray-300 hover:cursor-pointer"
          >
            <FiPlus size={20} />
            New Project
          </button>
        </div>

        {createdJustNow && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Project successfully created.
          </div>
        )}

        <div className="mt-12">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-black">
              Recently submitted
            </h2>

            <p className="text-sm text-gray-500">
              {loadingProjects
                ? "Loading..."
                : `${projects.length} project${projects.length === 1 ? "" : "s"}`}
            </p>
          </div>

          {projectError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {projectError}
            </div>
          )}

          {!loadingProjects && projects.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-8 py-16 text-center">
              <h3 className="text-xl font-semibold text-gray-900">
                No projects yet
              </h3>

              <button
                onClick={() => router.push("/project/client/project-setup")}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600 hover:cursor-pointer"
              >
                <FiPlus size={18} />
                Create First Project
              </button>
            </div>
          )}

          {projects.length > 0 && (
            <div className="space-y-6">
              {projects.map((project) => {
                const statusIndex = getStatusIndex(project.status);

                return (
                  <article
                    key={project.id}
                    className="overflow-hidden rounded-xl border border-gray-300 bg-white"
                  >
                    <div className="flex">
                      <div className="relative w-55 bg-gray-100">
                        {project.thumbnailUrl ? (
                          <Image
                            src={project.thumbnailUrl}
                            alt={project.projectName}
                            fill
                            sizes="220px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-gray-400">
                            No thumbnail
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-[22px] font-medium">
                              {project.projectName}
                            </h3>
                            <p className="mt-1 text-sm text-gray-700">
                              {project.timeInvestment} · {project.budgetRange}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              router.push(`/project/client/${project.id}`)
                            }
                            className="rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200 hover:cursor-pointer"
                          >
                            View more
                          </button>
                        </div>

                        <p className="mt-3 text-sm text-gray-700">
                          {project.projectDescription}
                        </p>

                        <div className="mt-6 grid grid-cols-5 gap-2 border-t pt-4 text-sm">
                          {STATUS_STEPS.map((step, index) => {
                            const active = index <= statusIndex;
                            const current = index === statusIndex;

                            return (
                              <div
                                key={step}
                                className={`text-center ${
                                  current
                                    ? "font-semibold text-black"
                                    : active
                                      ? "text-gray-800"
                                      : "text-gray-400"
                                }`}
                              >
                                {step}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
