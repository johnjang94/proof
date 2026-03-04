import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseInstance";
import { useState } from "react";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("logout error:", error);
        return;
      }

      const { data } = await supabase.auth.getUser();
      console.log("after logout user:", data.user);

      router.replace("/login");
    } catch (e) {
      console.error("logout exception:", e);
    } finally {
      setLoading(false);
    }
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
