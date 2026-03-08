"use client";

import { BsSuitcaseLg } from "react-icons/bs";
import ComingSoon from "@/components/common/coming-soon";

export default function JobsPage() {
  return (
    <ComingSoon
      title="Jobs is coming soon"
      subtitle="We’re building a better way to explore opportunities, discover project-based work, and connect with real-world roles."
      icon={BsSuitcaseLg}
    />
  );
}
