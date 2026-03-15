"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";
import { apiFetch } from "@/lib/apiFetch";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  projectId: string | null;
  createdAt: string;
  projectName?: string | null;
};

export default function NotificationBell({
  userId,
  variant,
}: {
  userId: string | null;
  variant: "client" | "participant";
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toastNotif, setToastNotif] = useState<Notification | null>(null);
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
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
      setNotifications(sorted);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const timer = setTimeout(() => fetchNotifications(), 0);

    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_user", userId);
    });

    socket.on("new_notification", (notif: Notification) => {
      setNotifications((prev) =>
        [notif, ...prev].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );

      setToastNotif(notif);
      setShowToast(true);

      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setShowToast(false), 5000);
    });

    return () => {
      clearTimeout(timer);
      socket.disconnect();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [fetchNotifications, userId]);

  const handleBellClick = () => {
    setShowToast(false);
    router.push(
      variant === "participant"
        ? "/notification/participant"
        : "/notification/client",
    );
  };

  return (
    <div className="relative">
      <button
        onClick={handleBellClick}
        className="relative flex items-center justify-center rounded-full p-2 hover:bg-gray-100 hover:cursor-pointer transition-colors"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showToast && toastNotif && (
        <div
          className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-gray-200 bg-white shadow-xl"
          style={{ animation: "slideDown 0.2s ease-out" }}
        >
          <style>{`
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div className="p-4">
            <p className="text-sm text-gray-500">{toastNotif.title}</p>
            <p className="mt-1 text-sm font-medium text-gray-900 line-clamp-2">
              {toastNotif.message}
            </p>
          </div>

          <div className="border-t border-gray-100 px-4 py-3">
            <button
              onClick={handleBellClick}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 hover:cursor-pointer transition-colors"
            >
              View message
            </button>
          </div>

          <button
            onClick={() => setShowToast(false)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 hover:cursor-pointer"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
