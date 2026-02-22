import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    if (loading) return;
    setLoading(true);

    await supabase.auth.signOut();

    setLoading(false);
    router.replace("/login");
  };

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={loading}
      className={className ?? "rounded-md border px-3 py-2 text-sm"}
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
