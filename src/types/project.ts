export type ProjectDetail = {
  id: string;
  projectName: string;
  thumbnailUrl?: string | null;
  projectDescription?: string | null;
  expectedOutcome?: string | null;
  projectDeadline?: string | null;
  createdAt?: string;
  viewCount?: number;
  submissionType?: string | null;
  companyName?: string | null;
  companyLogoUrl?: string | null;
  serviceDescription?: string | null;
};
