"use client";

import { useEffect, useRef } from "react";

/**
 * Closes a non-modal popover/menu on Escape or on a click outside its container.
 * For overlays that aren't built on the Dialog primitive (which already handles
 * this itself) — e.g. the notifications panel and mobile export dropdowns.
 */
export function useDismissableMenu<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  return ref;
}
