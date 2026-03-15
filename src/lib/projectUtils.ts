export const FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1600&auto=format&fit=crop";

export function isPopularProject(viewCount?: number): boolean {
  return (viewCount ?? 0) >= 10;
}

export function isNewProject(createdAt?: string): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created <= 7 * 24 * 60 * 60 * 1000;
}

export function formatDeadlineDate(deadlineStr?: string | null): string {
  if (!deadlineStr) return "TBD";
  const deadline = new Date(deadlineStr);
  if (Number.isNaN(deadline.getTime())) return "TBD";
  return deadline.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getLookingForLabel(submissionType?: string | null): string {
  return submissionType === "guided" ? "Project Coordinator" : "TBD";
}
