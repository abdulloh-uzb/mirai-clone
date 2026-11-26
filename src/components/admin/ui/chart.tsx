"use client";

import * as React from "react";
import { ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<string, { label: string; color: string }>;

const ChartContext = React.createContext<ChartConfig | null>(null);

function useChartConfig(): ChartConfig {
  const c = React.useContext(ChartContext);
  if (!c) throw new Error("Chart parts must be inside <ChartContainer>");
  return c;
}

export function ChartContainer({
  config,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  config: ChartConfig;
  children: React.ReactElement;
}) {
  const style = Object.fromEntries(
    Object.entries(config).map(([k, v]) => [`--color-${k}`, v.color]),
  ) as React.CSSProperties;
  return (
    <ChartContext.Provider value={config}>
      <div
        data-slot="chart"
        style={style}
        className={cn(
          "h-64 w-full text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

export const ChartTooltip = Tooltip;

type TooltipEntry = { dataKey?: unknown; value?: unknown };

export function ChartTooltipContent({
  active,
  payload,
  label,
  formatters,
}: {
  active?: boolean;
  payload?: readonly TooltipEntry[];
  label?: string | number;
  formatters?: Partial<Record<string, (value: number) => string>>;
}) {
  const config = useChartConfig();
  if (!active || !payload?.length) return null;
  return (
    <div className="grid min-w-32 gap-1 rounded-md border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md">
      {label !== undefined ? <p className="font-medium">{label}</p> : null}
      {payload.map((entry) => {
        const key = typeof entry.dataKey === "string" ? entry.dataKey : "";
        const item = config[key];
        if (!item) return null;
        const value = Number(entry.value ?? 0);
        return (
          <div key={key} className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-[2px]"
              style={{ background: item.color }}
            />
            <span className="text-muted-foreground">{item.label}</span>
            <span className="ml-auto font-medium tabular-nums">
              {formatters?.[key]?.(value) ?? String(value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
