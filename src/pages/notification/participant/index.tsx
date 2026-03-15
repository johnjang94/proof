"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { apiFetch } from "@/lib/apiFetch";

type Notification = {
  id: string;
  type: "application" | "discussion" | "interview_status" | "project";
  title: string;
  message: string;
  isRead: boolean;
  projectId: string | null;
  projectName: string | null;
  createdAt: string;
};

type FilterTab = "ALL" | "Discussions" | "Interview Status";

const TYPE_LABEL: Record<Notification["type"], string> = {
  application: "New Application",
  discussion: "Discussions",
  interview_status: "Interview Status update",
  project: "Project",
};

const TAB_TYPE_MAP: Record<FilterTab, Notification["type"] | null> = {
  ALL: null,
  Discussions: "discussion",
  "Interview Status": "interview_status",
};

function NotifRow({
  notif,
  isNew,
  onViewDetail,
}: {
  notif: Notification;
  isNew: boolean;
  onViewDetail: () => void;
}) {
  return (
    <div
      className={`rounded-lg px-5 py-4 ${isNew ? "bg-gray-400" : "bg-gray-200"}`}
    >
      {notif.projectName && (
        <p className="mb-1 text-sm text-gray-600">[ {notif.projectName} ]</p>
      )}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <p className="text-sm font-bold text-gray-900 shrink-0">
            {TYPE_LABEL[notif.type] ?? notif.type}
          </p>
          <p className="text-sm text-gray-700 truncate">{notif.message}</p>
        </div>
        <button
          onClick={onViewDetail}
          className="shrink-0 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 hover:cursor-pointer transition-colors"
        >
          View detail
        </button>
      </div>
    </div>
  );
}

export default function ParticipantNotice() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [newNotifs, setNewNotifs] = useState<Notification[]>([]);
  const [archiveNotifs, setArchiveNotifs] = useState<Notification[]>([]);

  const fetchAndMarkRead = useCallback(async () => {
    try {
      const res = await apiFetch("/notifications", { method: "GET" });
      if (!res.ok) return;
      const json: Notification[] = await res.json();
      const sorted = Array.isArray(json)
        ? [...json].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
        : [];

      const filtered = sorted.filter((n) => n.type !== "application");

      setNewNotifs(filtered.filter((n) => !n.isRead));
      setArchiveNotifs(filtered.filter((n) => n.isRead));

      const unreadIds = filtered.filter((n) => !n.isRead).map((n) => n.id);
      if (unreadIds.length > 0) {
        await apiFetch("/notifications/mark-read", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: unreadIds }),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndMarkRead();
  }, [fetchAndMarkRead]);

  const filterNotifs = (list: Notification[]) => {
    const typeFilter = TAB_TYPE_MAP[activeTab];
    if (!typeFilter) return list;
    return list.filter((n) => n.type === typeFilter);
  };

  const handleViewDetail = (notif: Notification) => {
    if (!notif.projectId) return;
    if (notif.type === "discussion") {
      return;
    }
    if (notif.type === "interview_status") {
      router.push(`/notification/participant/detail/${notif.projectId}`);
    }
  };

  const tabs: FilterTab[] = ["ALL", "Discussions", "Interview Status"];

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="px-10 mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-800"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <h1 className="text-2xl font-semibold text-gray-900">
            Notifications
          </h1>
        </div>

        <div className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:cursor-pointer ${
                activeTab === tab
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400">
            Loading...
          </div>
        ) : (
          <>
            {filterNotifs(newNotifs).length > 0 && (
              <div className="mb-6">
                <h2 className="text-base font-semibold text-gray-900 mb-2">
                  New
                </h2>
                <div className="border-t border-gray-300 mb-3" />
                <div className="space-y-2">
                  {filterNotifs(newNotifs).map((n) => (
                    <NotifRow
                      key={n.id}
                      notif={n}
                      isNew
                      onViewDetail={() => handleViewDetail(n)}
                    />
                  ))}
                </div>
              </div>
            )}

            {filterNotifs(archiveNotifs).length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-2">
                  Archive
                </h2>
                <div className="border-t border-gray-300 mb-3" />
                <div className="space-y-2">
                  {filterNotifs(archiveNotifs).map((n) => (
                    <NotifRow
                      key={n.id}
                      notif={n}
                      isNew={false}
                      onViewDetail={() => handleViewDetail(n)}
                    />
                  ))}
                </div>
              </div>
            )}

            {filterNotifs(newNotifs).length === 0 &&
              filterNotifs(archiveNotifs).length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="mb-4 rounded-full bg-gray-100 p-5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    No notifications yet
                  </p>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}
