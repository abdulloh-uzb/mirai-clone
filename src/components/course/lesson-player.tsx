"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import type { ProgressErrorKey } from "@/lib/validation/progress";
import { isActive } from "@/lib/course/active-time";
import {
  completeLesson,
  recordLessonTime,
} from "@/lib/portal/progress-actions";
import { BlockRenderer, type RenderableBlock } from "./blocks/block-renderer";

const FLUSH_EVERY_SECONDS = 15;

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * The lesson body plus its timer. Time counts only while the tab is visible
 * and the Student gave input in the last 2 minutes. The browser only reports
 * elapsed seconds; the database caps what it credits and enforces the minimum.
 */
export function LessonPlayer({
  enrollmentId,
  lessonId,
  minSeconds,
  initialSeconds,
  completed,
  blocks,
  nextHref,
}: {
  enrollmentId: string;
  lessonId: string;
  minSeconds: number;
  initialSeconds: number;
  completed: boolean;
  blocks: RenderableBlock[];
  /** Where "Next" goes after completing; null when this is the section's last lesson. */
  nextHref: string | null;
}) {
  const t = useTranslations("Player");
  const router = useRouter();
  const [serverSeconds, setServerSeconds] = useState(initialSeconds);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState<ProgressErrorKey | null>(null);
  const [busy, startTransition] = useTransition();

  const pendingRef = useRef(0);
  const lastInputRef = useRef(0);
  const blockPosRef = useRef(0);
  const inFlightRef = useRef(false);

  const flush = useCallback(async () => {
    if (inFlightRef.current || pendingRef.current <= 0) return;
    inFlightRef.current = true;
    const seconds = pendingRef.current;
    pendingRef.current = 0;
    setPending(0);
    const result = await recordLessonTime({
      enrollmentId,
      lessonId,
      seconds,
      blockPosition: blockPosRef.current,
    });
    inFlightRef.current = false;
    if (result.ok) {
      if (typeof result.secondsSpent === "number") {
        setServerSeconds(result.secondsSpent);
      }
      setError(null);
    } else {
      setError(result.error);
      if (result.error === "identityCheckRequired") router.refresh();
    }
  }, [enrollmentId, lessonId, router]);

  useEffect(() => {
    if (completed) return;
    lastInputRef.current = Date.now();
    const onInput = () => {
      lastInputRef.current = Date.now();
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    for (const e of events)
      window.addEventListener(e, onInput, { passive: true });

    const beacon = () => {
      if (pendingRef.current <= 0) return;
      const body = JSON.stringify({
        enrollmentId,
        lessonId,
        seconds: pendingRef.current,
        blockPosition: blockPosRef.current,
      });
      navigator.sendBeacon(
        "/api/portal/progress",
        new Blob([body], { type: "application/json" }),
      );
      pendingRef.current = 0;
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") beacon();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", beacon);

    const timer = window.setInterval(() => {
      const visible = document.visibilityState === "visible";
      if (!isActive(Date.now(), lastInputRef.current, visible)) return;
      pendingRef.current += 1;
      setPending(pendingRef.current);
      if (pendingRef.current >= FLUSH_EVERY_SECONDS) void flush();
    }, 1000);

    return () => {
      window.clearInterval(timer);
      for (const e of events) window.removeEventListener(e, onInput);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", beacon);
    };
  }, [completed, enrollmentId, lessonId, flush]);

  // Remember how far the Student scrolled.
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const pos = Number((entry.target as HTMLElement).dataset.position);
        if (pos > blockPosRef.current) blockPosRef.current = pos;
      }
    });
    root
      .querySelectorAll("[data-position]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [blocks]);

  // As soon as the local count reaches the minimum, sync so Next can unlock.
  const shown = serverSeconds + pending;
  useEffect(() => {
    if (!completed && shown >= minSeconds && serverSeconds < minSeconds) {
      void flush();
    }
  }, [completed, shown, minSeconds, serverSeconds, flush]);

  const unlocked = serverSeconds >= minSeconds;
  const remaining = Math.max(0, minSeconds - shown);

  function onNext() {
    startTransition(async () => {
      await flush();
      const result = await completeLesson({ enrollmentId, lessonId });
      if (!result.ok) {
        setError(result.error);
        if (result.error === "identityCheckRequired") router.refresh();
        return;
      }
      if (nextHref) router.push(nextHref);
      else router.refresh();
    });
  }

  return (
    <div>
      <div ref={containerRef} className="space-y-6">
        {blocks.map((block) => (
          <div key={block.id} data-position={block.position}>
            <BlockRenderer block={block} />
          </div>
        ))}
      </div>

      {completed ? null : (
        <div className="mt-10 flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4">
          <Button
            type="button"
            disabled={!unlocked || busy}
            onClick={onNext}
            data-testid="lesson-next"
          >
            {nextHref ? t("next") : t("finishLesson")}
          </Button>
          <p role="status" aria-live="polite" className="text-sm">
            {unlocked
              ? t("readyToContinue")
              : t("unlocksIn", { time: formatClock(remaining) })}
          </p>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {t(`errors.${error}`)}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
