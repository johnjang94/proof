import type { NextApiRequest, NextApiResponse } from "next";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/r2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { fileType, userId } = req.body;

    if (!fileType || !userId) {
      return res.status(400).json({ message: "Missing fileType or userId" });
    }

    const ext = fileType.split("/")[1] || "jpg";
    const key = `avatars/${userId}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 60 });

    return res.status(200).json({ uploadUrl, key });
  }

  if (req.method === "DELETE") {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ message: "Missing key" });
    }

    await r2.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
      }),
    );

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
