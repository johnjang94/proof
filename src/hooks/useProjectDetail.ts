import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import type { ProjectDetail } from "@/types/project";

function parseProjectItem(
  item: Record<string, unknown>,
  id: string,
): ProjectDetail {
  return {
    id: (item?.id as string) ?? id,
    projectName: (item?.projectName as string) ?? "Untitled Project",
    thumbnailUrl: (item?.thumbnailUrl as string) ?? null,
    projectDescription: (item?.projectDescription as string) ?? "",
    expectedOutcome: (item?.expectedOutcome as string) ?? "",
    projectDeadline: (item?.projectDeadline as string) ?? null,
    createdAt: item?.createdAt as string | undefined,
    viewCount: (item?.viewCount as number) ?? 0,
    submissionType: (item?.submissionType as string) ?? "self-guided",
    companyName:
      ((
        (item?.clientUser as Record<string, unknown>)?.company as Record<
          string,
          unknown
        >
      )?.name as string) ?? null,
    companyLogoUrl:
      ((
        (item?.clientUser as Record<string, unknown>)?.company as Record<
          string,
          unknown
        >
      )?.logoUrl as string) ?? null,
    serviceDescription:
      ((
        (item?.clientUser as Record<string, unknown>)?.company as Record<
          string,
          unknown
        >
      )?.serviceDescription as string) ?? null,
  };
}

type UseProjectDetailReturn = {
  project: ProjectDetail | null;
  loading: boolean;
  pageError: string;
};

export function useProjectDetail(
  id: string | string[] | undefined,
  isReady: boolean,
): UseProjectDetailReturn {
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    if (!isReady || !id || typeof id !== "string") return;

    let mounted = true;

    const loadProject = async () => {
      try {
        setLoading(true);
        setPageError("");

        const res = await apiFetch(`/projects/public/${id}`, { method: "GET" });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Failed to load project (${res.status}). ${text}`);
        }

        const data = await res.json();
        const item = data?.item ?? data?.project ?? data ?? null;

        if (!mounted) return;
        setProject(parseProjectItem(item, id));
      } catch (error) {
        if (!mounted) return;
        setPageError(
          error instanceof Error
            ? error.message
            : "Failed to load project details.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProject();
    return () => {
      mounted = false;
    };
  }, [isReady, id]);

  return { project, loading, pageError };
}
