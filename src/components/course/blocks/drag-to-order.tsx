"use client";

import { ArrowDownIcon, ArrowUpIcon, GripVerticalIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { shuffleSeeded } from "@/lib/course/shuffle";
import { cn } from "@/lib/utils";

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
    <div className="rounded-[22px] border border-line-blue bg-surface p-5 sm:p-6">
      <p className="text-xl leading-snug font-extrabold tracking-tight text-balance">
        {prompt}
      </p>
      <p className="mt-1.5 text-[15px] text-muted-foreground">
        {t("orderHint")}
      </p>
      <ol className="mt-4 grid gap-2">
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
            className={cn(
              "flex cursor-grab items-center gap-2.5 rounded-[16px] border-2 border-line-blue bg-card py-2 pr-2 pl-3 text-[16px] leading-snug active:cursor-grabbing",
              dragFrom === i && "border-primary bg-blue-tint",
            )}
          >
            <span
              aria-hidden
              className="grid size-7 shrink-0 place-items-center rounded-full bg-hero text-[13px] font-extrabold text-blue-text"
            >
              {i + 1}
            </span>
            <GripVerticalIcon
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span className="flex-1 font-semibold">{item}</span>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              disabled={i === 0}
              aria-label={t("moveUp", { item })}
              onClick={() => move(i, i - 1)}
            >
              <ArrowUpIcon aria-hidden />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              disabled={i === order.length - 1}
              aria-label={t("moveDown", { item })}
              onClick={() => move(i, i + 1)}
            >
              <ArrowDownIcon aria-hidden />
            </Button>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setResult(
              order.every((v, i) => v === items[i]) ? "correct" : "wrong",
            )
          }
        >
          {t("checkOrder")}
        </Button>
        {result ? (
          <p
            role="status"
            className={cn(
              "inline-flex min-h-10 items-center rounded-full px-4 text-[15px] font-bold",
              result === "correct"
                ? "bg-green-tint text-green-ink"
                : "bg-alert-bg text-alert",
            )}
          >
            {result === "correct" ? t("orderCorrect") : t("orderWrong")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
