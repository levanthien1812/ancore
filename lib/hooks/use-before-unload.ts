"use client";

import { useEffect } from "react";

/**
 * A custom hook to show a confirmation prompt before the user leaves the page.
 * @param when - A boolean to determine whether the prompt should be shown.
 */
export const useBeforeUnload = (when: boolean) => {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (when) {
        event.preventDefault();
        event.returnValue = ""; // Required for Chrome
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [when]);
};
