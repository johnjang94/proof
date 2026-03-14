import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { apiFetch } from "@/lib/apiFetch";

type Applicant = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  portfolioLink: string | null;
  resumeUrl: string | null;
  resumeR2Key: string | null;
  avatarUrl: string | null;
  createdAt: string;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Shortlist() {
  const router = useRouter();
  const { projectId } = router.query;

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resumeApplicantId, setResumeApplicantId] = useState<string | null>(
    null,
  );
  const [choosingId, setChoosingId] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady || !projectId || typeof projectId !== "string") return;

    const fetchApplicants = async () => {
      try {
        const res = await apiFetch(
          `/project-applications/by-project?projectId=${projectId}`,
          { method: "GET" },
        );
        if (!res.ok) throw new Error("Failed to load applicants.");
        const json = await res.json();
        setApplicants(Array.isArray(json) ? json : []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load applicants.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [router.isReady, projectId]);

  const handleChooseCandidate = async (applicant: Applicant) => {
    if (!projectId || typeof projectId !== "string") return;
    setChoosingId(applicant.id);

    try {
      const res = await apiFetch(`/projects/${projectId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "under_review" }),
      });
      if (!res.ok) throw new Error("Failed to update project status.");
    } catch (err) {
      console.error(err);
    } finally {
      setChoosingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-sm text-red-500">
        {error}
      </div>
    );
  }

  const subtitle =
    applicants.length === 1
      ? "You've got someone who is interested in working with you! Would you like to check it out?"
      : "You've got some people interested in working with you! Who would you like to start the journey with?";

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Let&apos;s touch the basics
          </h1>
          <p className="mt-3 text-gray-600">{subtitle}</p>
        </div>

        {applicants.length === 0 && (
          <div className="text-center py-20 text-sm text-gray-400">
            No applicants yet.
          </div>
        )}

        <div className="space-y-4">
          {applicants.map((applicant) => {
            const resumeSrc = applicant.resumeUrl ?? applicant.resumeR2Key;

            return (
              <div key={applicant.id}>
                <div className="bg-white rounded-2xl border border-gray-200 px-8 py-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-5">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gray-200">
                        <Image
                          src={applicant.avatarUrl ?? "/placeholder-avatar.png"}
                          alt={`${applicant.firstName} ${applicant.lastName}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {applicant.firstName} {applicant.lastName}
                        </h2>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {applicant.position}
                        </p>
                        <p className="mt-0.5 text-sm text-gray-400">
                          Applied on {formatDate(applicant.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      {resumeSrc && (
                        <button
                          onClick={() =>
                            setResumeApplicantId(
                              resumeApplicantId === applicant.id
                                ? null
                                : applicant.id,
                            )
                          }
                          className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                          </svg>
                          {resumeApplicantId === applicant.id
                            ? "hide resume"
                            : "view resume"}
                        </button>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            router.push(
                              `/chat/client/${applicant.id}?projectId=${projectId}`,
                            )
                          }
                          className="flex items-center gap-2 rounded-lg bg-cyan-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-cyan-300 hover:cursor-pointer transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          Let&apos;s chat
                        </button>
                        <button
                          onClick={() => handleChooseCandidate(applicant)}
                          disabled={choosingId === applicant.id}
                          className="flex items-center gap-2 rounded-lg bg-cyan-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-cyan-300 hover:cursor-pointer transition-colors disabled:opacity-60"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                          </svg>
                          {choosingId === applicant.id
                            ? "Processing..."
                            : "I choose this candidate"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {resumeApplicantId === applicant.id && resumeSrc && (
                  <div
                    className="mt-2 rounded-2xl border border-gray-200 bg-white overflow-hidden"
                    style={{ animation: "slideDown 0.2s ease-out" }}
                  >
                    <style>{`
                      @keyframes slideDown {
                        from { opacity: 0; transform: translateY(-8px); }
                        to   { opacity: 1; transform: translateY(0); }
                      }
                    `}</style>
                    <iframe
                      src={resumeSrc}
                      className="w-full h-150"
                      title={`${applicant.firstName} ${applicant.lastName} resume`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
