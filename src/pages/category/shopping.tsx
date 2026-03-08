"use client";

import { FiShoppingBag } from "react-icons/fi";
import ComingSoon from "@/components/common/coming-soon";

export default function ShoppingPage() {
  return (
    <ComingSoon
      title="Shopping is coming soon"
      subtitle="We’re preparing a more premium shopping experience with curated items, cleaner discovery, and a smoother flow."
      icon={FiShoppingBag}
    />
  );
}
