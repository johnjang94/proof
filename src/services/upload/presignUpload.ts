import { apiFetch } from "@/lib/apiFetch";
import type { PresignUploadResponse, UploadKind } from "./types";

export async function presignUpload(
  file: File,
  kind: UploadKind,
): Promise<PresignUploadResponse> {
  const response = await apiFetch("/uploads/presign", {
    method: "POST",
    body: JSON.stringify({
      kind,
      filename: file.name,
      contentType: file.type,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Failed to get upload URL (${response.status}). ${text}`);
  }

  return (await response.json()) as PresignUploadResponse;
}
