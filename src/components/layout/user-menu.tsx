"use client";

import { lazy, Suspense, useState } from "react";
import { UserMenuTrigger } from "./user-menu-trigger";

type Props = { initials: string; firstName: string };

// The dropdown (Radix menu) loads on the first click, not with the page.
const UserMenuDropdown = lazy(() =>
  import("./user-menu-dropdown").then((m) => ({ default: m.UserMenuDropdown })),
);

export function UserMenu(props: Props) {
  const [requested, setRequested] = useState(false);
  return requested ? (
    <Suspense fallback={<UserMenuTrigger {...props} />}>
      <UserMenuDropdown {...props} />
    </Suspense>
  ) : (
    <UserMenuTrigger {...props} onClick={() => setRequested(true)} />
  );
}
