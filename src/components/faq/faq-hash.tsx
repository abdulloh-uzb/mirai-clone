"use client";

import { useEffect } from "react";

/** Opens, scrolls to and focuses the question named by the URL `#slug`. */
export function FaqHash() {
  useEffect(() => {
    function open() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const item = document.getElementById(id);
      if (!(item instanceof HTMLDetailsElement)) return;
      item.hidden = false;
      item.open = true;
      item.scrollIntoView({ block: "start" });
      item.querySelector("summary")?.focus({ preventScroll: true });
    }
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);
  return null;
}
