"use client";

import { useEffect, useRef, useState } from "react";

/**
 * True once the element is within `margin` of the viewport. Used to load
 * below-the-fold client code (and its libraries) only when it is about to be
 * seen, so it stays out of the first load.
 */
export function useNearViewport<T extends Element>(margin = "300px") {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || near) return;
    if (typeof IntersectionObserver === "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no observer support: load right away
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setNear(true);
      },
      { rootMargin: margin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [margin, near]);

  return [ref, near] as const;
}
