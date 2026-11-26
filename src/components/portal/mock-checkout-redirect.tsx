"use client";

import { useEffect } from "react";

/**
 * Full navigation to the mock checkout route, so its 302 to `/portal?paid=1`
 * updates the address bar (an RSC redirect would leave the route's URL).
 */
export function MockCheckoutRedirect({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  useEffect(() => {
    window.location.replace(href);
  }, [href]);
  return (
    <noscript>
      <a href={href}>{label}</a>
    </noscript>
  );
}
