"use client";

import { CiChat1 } from "react-icons/ci";
import ComingSoon from "@/components/common/coming-soon";

export default function ChatPage() {
  return (
    <ComingSoon
      title="Chat is coming soon"
      subtitle="Messaging is being designed to feel faster, cleaner, and more focused for real collaboration."
      icon={CiChat1}
    />
  );
}
