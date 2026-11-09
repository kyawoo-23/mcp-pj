"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { recordStudyConsentAction } from "@/app/actions/consent";
import { StudyConsentDialog } from "@/components/consent/study-consent-dialog";

export function StudyConsentAccountDialog() {
  const router = useRouter();

  const handleAgree = async () => {
    const result = await recordStudyConsentAction();
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  };

  return <StudyConsentDialog open showSignOut onAgree={handleAgree} />;
}
