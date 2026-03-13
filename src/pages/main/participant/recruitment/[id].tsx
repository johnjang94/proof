import ComingSoon from "@/components/common/coming-soon";
import { MdWorkOutline } from "react-icons/md";

export default function RecruitmentComingSoon() {
  return (
    <ComingSoon
      badge="Coming Soon"
      icon={MdWorkOutline}
      title="Applications are on their way."
      subtitle="We're building a smooth application experience for you. Check back soon — submitting your resume will be easier than ever."
    />
  );
}
