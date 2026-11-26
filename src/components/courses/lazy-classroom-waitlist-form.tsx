"use client";

import dynamic from "next/dynamic";
import { useNearViewport } from "@/lib/use-near-viewport";

// The form (react-hook-form and zod) loads only when it is about to be seen.
const ClassroomWaitlistForm = dynamic(
  () =>
    import("./classroom-waitlist-form").then((m) => m.ClassroomWaitlistForm),
  { ssr: false },
);

export function LazyClassroomWaitlistForm({
  counties,
}: {
  counties: { slug: string; name: string }[];
}) {
  const [ref, near] = useNearViewport<HTMLDivElement>();
  return (
    <div ref={ref} className="min-h-72">
      {near ? <ClassroomWaitlistForm counties={counties} /> : null}
    </div>
  );
}
