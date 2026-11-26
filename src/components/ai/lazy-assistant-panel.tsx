"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const OPEN_EVENT = "open-ai-assistant";

const AssistantPanel = dynamic(
  () => import("./assistant-panel").then((m) => m.AssistantPanel),
  { ssr: false },
);

/**
 * Loads the assistant (chat SDK and sheet) only when someone asks for it, so
 * it stays out of the first load of every page. The first request opens the
 * panel as soon as it has loaded.
 */
export function LazyAssistantPanel() {
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    if (requested) return;
    const onOpen = () => setRequested(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [requested]);

  return requested ? <AssistantPanel initialOpen /> : null;
}
