"use client";

import { ArrowDownIcon, ArrowUpIcon, GripVerticalIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { shuffleSeeded } from "@/lib/course/shuffle";

export function DragToOrderBlock({
  blockId,
  prompt,
  items,
}: {
  blockId: string;
  prompt: string;
  items: string[];
}) {
  const t = useTranslations("Player");
  const initial = useMemo(
    () => shuffleSeeded(items, blockId),
    [items, blockId],
  );
  const [order, setOrder] = useState(initial);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);

  function move(from: number, to: number) {
    if (to < 0 || to >= order.length || from === to) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setOrder(next);
    setResult(null);
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="font-medium">{prompt}</p>
      <p className="mt-1 text-sm text-muted-foreground">{t("orderHint")}</p>
      <ol className="mt-3 space-y-2">
        {order.map((item, i) => (
          <li
            key={item}
            draggable
            onDragStart={() => setDragFrom(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragFrom !== null) move(dragFrom, i);
              setDragFrom(null);
            }}
            className="flex items-center gap-2 rounded-lg border bg-background p-2 text-sm"
          >
            <GripVerticalIcon
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span className="flex-1">{item}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9"
              disabled={i === 0}
              aria-label={t("moveUp", { item })}
              onClick={() => move(i, i - 1)}
            >
              <ArrowUpIcon aria-hidden />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9"
              disabled={i === order.length - 1}
              aria-label={t("moveDown", { item })}
              onClick={() => move(i, i + 1)}
            >
              <ArrowDownIcon aria-hidden />
            </Button>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex items-center gap-3">
        <Button
          type="button"
          onClick={() =>
            setResult(
              order.every((v, i) => v === items[i]) ? "correct" : "wrong",
            )
          }
        >
          {t("checkOrder")}
        </Button>
        {result ? (
          <p role="status" className="text-sm font-medium">
            {result === "correct" ? t("orderCorrect") : t("orderWrong")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
