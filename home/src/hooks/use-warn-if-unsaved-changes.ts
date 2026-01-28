"use client";

import { useEffect } from "react";

export function useWarnIfUnsavedChanges(unsavedChanges: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!unsavedChanges) return;
      e.preventDefault();
      e.returnValue = ""; // Included for legacy support, e.g. Chrome/Edge < 119
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [unsavedChanges]);
}
