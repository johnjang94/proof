import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { supabase } from "@/lib/supabaseInstance";
import { apiFetch } from "@/lib/apiFetch";

type Message = {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export default function ChatPage() {
  const router = useRouter();

  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  useEffect(() => {
    if (initialized.current) return;

    const parts = window.location.pathname.split("/");
    const applicantId = parts[parts.length - 1];
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("projectId");

    if (!applicantId || !projectId) {
      setError("Missing applicantId or projectId");
      setLoading(false);
      return;
    }

    initialized.current = true;

    const init = async () => {
      try {
        const roomRes = await apiFetch("/chat/room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, applicantId }),
        });

        if (!roomRes.ok) {
          const text = await roomRes.text();
          throw new Error(`room error ${roomRes.status}: ${text}`);
        }

        const room = await roomRes.json();
        setChatRoomId(room.id);

        const msgRes = await apiFetch(`/chat/messages?chatRoomId=${room.id}`);
        const msgs = await msgRes.json();
        setMessages(Array.isArray(msgs) ? msgs : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!chatRoomId) return;

    const interval = setInterval(async () => {
      try {
        const msgRes = await apiFetch(
          `/chat/messages?chatRoomId=${chatRoomId}`,
        );
        const msgs = await msgRes.json();
        if (Array.isArray(msgs)) {
          setMessages((prev) => {
            if (msgs.length !== prev.length) return msgs;
            return prev;
          });
        }
      } catch {
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [chatRoomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatRoomId || !currentUserId) return;

    const content = input;
    setInput("");

    await apiFetch("/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatRoomId,
        senderId: currentUserId,
        content,
      }),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-15">
      <div
        className="w-full flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden"
        style={{ height: "75vh" }}
      >
        {/* 상단 뒤로가기 */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-700">Back</span>
        </div>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              No messages yet. Say hi!
            </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                {!isMe && (
                  <div className="h-8 w-8 rounded-full bg-gray-200 shrink-0 overflow-hidden">
                    <Image
                      src="/placeholder-avatar.png"
                      alt="avatar"
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                    isMe
                      ? "bg-cyan-200 text-gray-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* 입력창 */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="type your reply"
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-cyan-300"
          />
          <button
            onClick={handleSend}
            className="rounded-lg bg-cyan-200 px-5 py-2 text-sm font-medium text-gray-800 hover:bg-cyan-300 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
