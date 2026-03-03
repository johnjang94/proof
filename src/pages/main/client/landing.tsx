"use client";

import { supabase } from "@/lib/supabaseInstance";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FiPlus } from "react-icons/fi";

export default function Main() {
  const router = useRouter();
  const [firstName, setFirstName] = useState<string>("");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .single();

      if (data?.first_name) setFirstName(data.first_name);
    };

    getUser();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="mx-auto px-20 py-14">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-black">
            Welcome {firstName ? firstName : ""},
          </h1>
          <p className="text-gray-600 text-lg">
            Let&apos;s get started on a project
          </p>
        </div>

        <div className="flex justify-center mt-28">
          <button
            type="button"
            onClick={() => router.push("/project/client/project-setup")}
            className="
              flex items-center gap-2 hover:cursor-pointer
              bg-gray-200
              hover:bg-gray-300
              text-gray-800
              px-10 py-4
              rounded-lg
              text-lg
              transition
            "
          >
            <FiPlus size={20} />
            New Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-28 text-center">
          <div className="text-gray-700 text-lg">Weekly review included</div>
          <div className="text-gray-700 text-lg">
            Performance Tracking built-in
          </div>
          <div className="text-gray-700 text-lg">Hiring options available</div>
        </div>
      </div>
    </div>
  );
}
