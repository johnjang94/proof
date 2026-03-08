export type UploadKind = "profile-avatar" | "project-thumbnail" | "project-mp4";

export type PresignUploadResponse = {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  maxBytes: number;
  allowedMimeTypes: string[];
};
