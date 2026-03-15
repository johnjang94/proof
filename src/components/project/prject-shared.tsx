import Image from "next/image";
import { FiChevronRight } from "react-icons/fi";
import { MdLocalFireDepartment } from "react-icons/md";
import { FALLBACK_BANNER } from "@/lib/projectUtils";

type ProjectBreadcrumbProps = {
  companyName?: string | null;
  companyLogoUrl?: string | null;
};

export function ProjectBreadcrumb({
  companyName,
  companyLogoUrl,
}: ProjectBreadcrumbProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-medium text-[#111111]">
      <span>DESIGN</span>
      <FiChevronRight className="text-[15px]" />
      <span className="inline-flex items-center gap-2 text-[#2a2a2a]">
        {companyLogoUrl && (
          <Image
            src={companyLogoUrl}
            alt={companyName ?? "Company logo"}
            width={20}
            height={20}
            className="rounded-sm object-cover"
            unoptimized
          />
        )}
        <span className="truncate">{companyName ?? "General"}</span>
      </span>
    </div>
  );
}

type ProjectBannerProps = {
  thumbnailUrl?: string | null;
  projectName: string;
};

export function ProjectBanner({
  thumbnailUrl,
  projectName,
}: ProjectBannerProps) {
  const bannerUrl = thumbnailUrl || FALLBACK_BANNER;
  return (
    <div className="relative mb-4 overflow-hidden rounded-[20px] bg-[#d9d9d9]">
      <div className="relative h-65 w-full md:h-107.5">
        <Image
          src={bannerUrl}
          alt={projectName}
          fill
          className="object-cover"
          priority
          unoptimized
        />
      </div>
    </div>
  );
}

type ProjectTitleProps = {
  projectName: string;
  isNew: boolean;
  isPopular: boolean;
};

export function ProjectTitle({
  projectName,
  isNew,
  isPopular,
}: ProjectTitleProps) {
  return (
    <div className="mb-5 flex items-center gap-3">
      {isNew && (
        <span className="inline-flex items-center rounded-md bg-[#bfe0ff] px-3 py-1 text-sm font-medium text-[#0f2942]">
          New
        </span>
      )}
      <h1 className="text-2xl font-medium leading-tight tracking-[-0.02em] md:text-4xl">
        {projectName}
      </h1>
      {isPopular && (
        <MdLocalFireDepartment className="text-[28px] text-red-500 md:text-[34px]" />
      )}
    </div>
  );
}

export function ProjectLoadingSkeleton() {
  return (
    <main className="min-h-screen py-5 md:px-6">
      <div className="mx-auto w-full max-w-6xl animate-pulse">
        <div className="mb-4 h-6 w-56 rounded bg-gray-200" />
        <div className="mb-4 h-70 w-full rounded-2xl bg-gray-200 md:h-105" />
        <div className="mb-4 h-10 w-3/4 rounded bg-gray-200" />
        <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
          <div className="h-80 rounded-2xl bg-gray-200" />
          <div className="h-80 rounded-2xl bg-gray-200" />
        </div>
      </div>
    </main>
  );
}

type ProjectErrorStateProps = {
  message?: string;
  onBack: () => void;
};

export function ProjectErrorState({ message, onBack }: ProjectErrorStateProps) {
  return (
    <main className="min-h-screen py-8 md:px-6">
      <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
        <p className="text-base font-medium text-red-600">
          {message || "Project not found."}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Go back
        </button>
      </div>
    </main>
  );
}
