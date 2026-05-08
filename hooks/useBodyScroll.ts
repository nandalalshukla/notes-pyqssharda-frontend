import { useEffect } from "react";

/**
 * Custom hook to prevent body scroll when modals/overlays are open
 * Automatically restores scroll when component unmounts
 * @param isOpen - Whether the modal/overlay is open
 */
export function useBodyScroll(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      const previousOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";

      // Also handle the body element for better cross-browser support
      const previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Prevent scroll on iOS by setting position fixed
      const previousBodyPosition = document.body.style.position;
      const previousBodyWidth = document.body.style.width;
      document.body.style.position = "fixed";
      document.body.style.width = "100%";

      return () => {
        // Restore previous scroll state
        document.documentElement.style.overflow = previousOverflow;
        document.body.style.overflow = previousBodyOverflow;
        document.body.style.position = previousBodyPosition;
        document.body.style.width = previousBodyWidth;
      };
    }
  }, [isOpen]);
}
