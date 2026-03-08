"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseInstance";
import { apiFetch } from "@/lib/apiFetch";
import { uploadAsset } from "@/services/upload/uploadAsset";
import type { UploadKind } from "@/services/upload/types";

type FormState = {
  projectName: string;
  timeInvestment: string;
  budgetRange: string;
  projectDescription: string;
  goals: string;
};

type UploadState = {
  file?: File;
  url?: string;
  uploading: boolean;
  error?: string;
};

const EMPTY_FORM: FormState = {
  projectName: "",
  timeInvestment: "",
  budgetRange: "",
  projectDescription: "",
  goals: "",
};

const EMPTY_UPLOAD: UploadState = {
  uploading: false,
};

export default function ProjectIntake() {
  const id = useId();
  const router = useRouter();

  const thumbInputRef = useRef<HTMLInputElement | null>(null);
  const mp4InputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [thumb, setThumb] = useState<UploadState>(EMPTY_UPLOAD);
  const [mp4, setMp4] = useState<UploadState>(EMPTY_UPLOAD);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    const requiredText =
      form.projectName.trim() &&
      form.timeInvestment.trim() &&
      form.budgetRange.trim() &&
      form.projectDescription.trim() &&
      form.goals.trim();

    const uploadsOk = !thumb.uploading && !mp4.uploading;
    const thumbReady = !!thumb.url;

    return !!requiredText && uploadsOk && thumbReady && !submitting;
  }, [form, thumb, mp4, submitting]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const uploadPickedFile = async (
    file: File | undefined,
    kind: UploadKind,
    setState: React.Dispatch<React.SetStateAction<UploadState>>,
    fallbackMessage: string,
  ) => {
    if (!file) return;

    setState({
      file,
      uploading: true,
      error: undefined,
      url: undefined,
    });

    try {
      const url = await uploadAsset(file, kind);
      setState({
        file,
        url,
        uploading: false,
        error: undefined,
      });
    } catch (error) {
      setState({
        file,
        uploading: false,
        url: undefined,
        error: error instanceof Error ? error.message : fallbackMessage,
      });
    }
  };

  const onPickThumbnail = async (file?: File) => {
    await uploadPickedFile(
      file,
      "project-thumbnail",
      setThumb,
      "Thumbnail upload failed.",
    );
  };

  const onPickMp4 = async (file?: File) => {
    await uploadPickedFile(file, "project-mp4", setMp4, "MP4 upload failed.");
  };

  const removeThumbnail = () => {
    setThumb(EMPTY_UPLOAD);
    if (thumbInputRef.current) {
      thumbInputRef.current.value = "";
    }
  };

  const removeMp4 = () => {
    setMp4(EMPTY_UPLOAD);
    if (mp4InputRef.current) {
      mp4InputRef.current.value = "";
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setThumb(EMPTY_UPLOAD);
    setMp4(EMPTY_UPLOAD);

    if (thumbInputRef.current) {
      thumbInputRef.current.value = "";
    }

    if (mp4InputRef.current) {
      mp4InputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const userId = user?.id;

      if (!userId) {
        alert("You need to login first");
        return;
      }

      const res = await apiFetch("/my/project-intakes", {
        method: "POST",
        body: JSON.stringify({
          clientUserId: userId,
          projectName: form.projectName.trim(),
          timeInvestment: form.timeInvestment.trim(),
          budgetRange: form.budgetRange.trim(),
          projectDescription: form.projectDescription.trim(),
          goals: form.goals.trim(),
          thumbnailUrl: thumb.url,
          mp4Url: mp4.url ?? null,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Submit failed (${res.status}). ${text}`);
      }

      const result = await res.json();
      console.log("INTAKE RESULT:", result);

      resetForm();
      await router.push("/client/landing?created=1");
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-xl border bg-white px-6 py-4">
          <h1 className="text-sm font-semibold tracking-wide text-gray-900">
            PROJECT INTAKE
          </h1>
        </div>

        <div className="bg-gray-50 py-3">
          <div className="rounded-md px-6">
            <form onSubmit={handleSubmit}>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Project Information
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Our HR team will review and structure your project to ensure
                  optimal resource alignment and execution strategy.
                </p>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor={`${id}-name`}
                    className="block text-sm font-medium text-gray-900"
                  >
                    Name of the project
                  </label>
                  <input
                    id={`${id}-name`}
                    name="projectName"
                    value={form.projectName}
                    onChange={handleChange}
                    type="text"
                    placeholder="i.e. Bloom the Flowers"
                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`${id}-time`}
                    className="block text-sm font-medium text-gray-900"
                  >
                    How much time would you invest in this project?
                  </label>
                  <select
                    id={`${id}-time`}
                    name="timeInvestment"
                    value={form.timeInvestment}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
                  >
                    <option value="" disabled>
                      Please choose
                    </option>
                    <option>1–3 hours/week</option>
                    <option>4–6 hours/week</option>
                    <option>7–10 hours/week</option>
                    <option>10+ hours/week</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor={`${id}-budget`}
                    className="block text-sm font-medium text-gray-900"
                  >
                    Estimated Budget Range
                  </label>
                  <select
                    id={`${id}-budget`}
                    name="budgetRange"
                    value={form.budgetRange}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
                  >
                    <option value="" disabled>
                      Please choose
                    </option>
                    <option>$500 – $1,000</option>
                    <option>$1,000 – $3,000</option>
                    <option>$3,000 – $7,500</option>
                    <option>$7,500+</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor={`${id}-desc`}
                    className="block text-sm font-medium text-gray-900"
                  >
                    Project Description
                  </label>
                  <textarea
                    id={`${id}-desc`}
                    name="projectDescription"
                    value={form.projectDescription}
                    onChange={handleChange}
                    rows={5}
                    placeholder="i.e. (company name) is (a platform / a website / a product) that offers (service / product)..."
                    className="mt-2 w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-medium text-gray-900">
                      Project Description (MP4)
                    </label>
                    <span className="rounded bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                      optional
                    </span>
                  </div>

                  <label
                    htmlFor={`${id}-mp4`}
                    className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 bg-gray-50 px-6 py-10 text-center hover:bg-gray-100"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-10 w-10 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 16V4" />
                      <path d="M7 9l5-5 5 5" />
                      <path d="M20 16v4H4v-4" />
                    </svg>

                    <div className="mt-3 text-sm font-medium text-gray-800">
                      {mp4.uploading
                        ? "Uploading..."
                        : mp4.file
                          ? mp4.file.name
                          : "Drag & Drop your video here"}
                    </div>

                    <div className="text-xs text-gray-500">
                      {mp4.url ? "Uploaded ✅" : "…or click here to browse"}
                    </div>

                    <div className="mt-2 text-[11px] text-gray-500">
                      supported file type: .mp4
                    </div>

                    {mp4.error ? (
                      <div className="mt-2 text-xs text-red-600">
                        {mp4.error}
                      </div>
                    ) : null}

                    <input
                      ref={mp4InputRef}
                      id={`${id}-mp4`}
                      type="file"
                      accept="video/mp4"
                      className="hidden"
                      onChange={(e) => onPickMp4(e.target.files?.[0])}
                    />
                  </label>

                  {mp4.file ? (
                    <button
                      type="button"
                      className="mt-2 text-xs text-gray-600 hover:text-gray-900"
                      onClick={removeMp4}
                      disabled={mp4.uploading}
                    >
                      Remove MP4
                    </button>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor={`${id}-goals`}
                    className="block text-sm font-medium text-gray-900"
                  >
                    What is your goal for this project?
                  </label>
                  <textarea
                    id={`${id}-goals`}
                    name="goals"
                    value={form.goals}
                    onChange={handleChange}
                    rows={4}
                    placeholder="i.e. Increase conversion, improve UX, validate a new feature, streamline operations..."
                    className="mt-2 w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-medium text-gray-900">
                      Project Thumbnail
                    </label>
                    <span className="rounded bg-gray-200 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                      required
                    </span>
                  </div>

                  <label
                    htmlFor={`${id}-thumb`}
                    className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 bg-gray-50 px-6 py-10 text-center hover:bg-gray-100"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-10 w-10 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 16V4" />
                      <path d="M7 9l5-5 5 5" />
                      <path d="M20 16v4H4v-4" />
                    </svg>

                    <div className="mt-3 text-sm font-medium text-gray-800">
                      {thumb.uploading
                        ? "Uploading..."
                        : thumb.file
                          ? thumb.file.name
                          : "Drag & Drop your photo here"}
                    </div>

                    <div className="text-xs text-gray-500">
                      {thumb.url ? "Uploaded ✅" : "…or click here to browse"}
                    </div>

                    <div className="mt-2 text-[11px] text-gray-500">
                      supported file types: .jpg, .png, .webp
                    </div>

                    {thumb.error ? (
                      <div className="mt-2 text-xs text-red-600">
                        {thumb.error}
                      </div>
                    ) : null}

                    <input
                      ref={thumbInputRef}
                      id={`${id}-thumb`}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => onPickThumbnail(e.target.files?.[0])}
                    />
                  </label>

                  {thumb.file ? (
                    <button
                      type="button"
                      className="mt-2 text-xs text-gray-600 hover:text-gray-900"
                      onClick={removeThumbnail}
                      disabled={thumb.uploading}
                    >
                      Remove Thumbnail
                    </button>
                  ) : null}
                </div>

                <div className="mt-2 flex items-center justify-between pt-2">
                  <button
                    type="button"
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
                  >
                    &lt; Previous
                  </button>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="cursor-pointer rounded-md bg-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                </div>

                {!thumb.url ? (
                  <p className="text-xs text-gray-500">
                    * You need to upload a thumbnail in order to proceed
                  </p>
                ) : null}
              </div>
            </form>
          </div>

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
