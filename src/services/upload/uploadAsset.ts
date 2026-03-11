import { apiFetch } from "@/lib/apiFetch";

export type UploadKind =
  | "profile-avatar"
  | "project-thumbnail"
  | "project-mp4"
  | "project-video"
  | "company-logo";

type PresignResponse = {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  maxBytes: number;
  allowedMimeTypes: string[];
};

export async function uploadAsset(file: File, kind: UploadKind) {
  const presignRes = await apiFetch("/uploads/presign", {
    method: "POST",
    body: JSON.stringify({
      kind,
      filename: file.name,
      contentType: file.type,
    }),
  });

  if (!presignRes.ok) {
    const text = await presignRes.text().catch(() => "");
    throw new Error(`Failed to get upload URL (${presignRes.status}). ${text}`);
  }

  const { uploadUrl, fileUrl, maxBytes, allowedMimeTypes } =
    (await presignRes.json()) as PresignResponse;

  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error("This file type is not allowed.");
  }

  if (file.size > maxBytes) {
    throw new Error(
      `File is too large. Maximum allowed size is ${Math.floor(maxBytes / 1024 / 1024)}MB.`,
    );
  }

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!putRes.ok) {
    throw new Error(`Upload failed (${putRes.status}).`);
  }

  return fileUrl;
}
