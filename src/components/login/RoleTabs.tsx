import type { Role } from "@/pages/category/login";

export default function RoleTabs({
  role,
  setRole,
  className = "",
}: {
  role: Role;
  setRole: (role: Role) => void;
  className?: string;
}) {
  const base = "h-10 flex-1 rounded-md text-xl font-medium transition-colors";
  const on = "bg-sky-100 text-sky-700";
  const off = "text-zinc-900 hover:cursor-pointer";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={() => setRole("participant")}
        className={[base, role === "participant" ? on : off].join(" ")}
      >
        Participant
      </button>
      <button
        type="button"
        onClick={() => setRole("client")}
        className={[base, role === "client" ? on : off].join(" ")}
      >
        Client
      </button>
    </div>
  );
}
