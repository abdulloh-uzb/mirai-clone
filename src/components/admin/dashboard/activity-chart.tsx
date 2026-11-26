"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../ui/chart";

export function ActivityChart({
  points,
  locale,
  salesLabel,
  enrollmentsLabel,
}: {
  points: { label: string; sales: number; enrollments: number }[];
  locale: string;
  salesLabel: string;
  enrollmentsLabel: string;
}) {
  const usd = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  const config = {
    sales: { label: salesLabel, color: "var(--chart-1)" },
    enrollments: { label: enrollmentsLabel, color: "var(--chart-2)" },
  } satisfies ChartConfig;

  return (
    <div>
      <div className="mb-2 flex gap-4 text-xs text-muted-foreground">
        {Object.entries(config).map(([key, c]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-2.5 rounded-[2px]"
              style={{ background: c.color }}
            />
            {c.label}
          </span>
        ))}
      </div>
      <ChartContainer config={config}>
        <ComposedChart
          data={points}
          margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
          />
          <YAxis
            yAxisId="sales"
            width={56}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => usd.format(v)}
          />
          <YAxis
            yAxisId="enrollments"
            orientation="right"
            width={32}
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
          />
          <ChartTooltip
            cursor={{ fill: "var(--muted)" }}
            content={
              <ChartTooltipContent
                formatters={{ sales: (v) => usd.format(v) }}
              />
            }
          />
          <Bar
            yAxisId="sales"
            dataKey="sales"
            fill="var(--color-sales)"
            radius={[3, 3, 0, 0]}
            maxBarSize={18}
          />
          <Line
            yAxisId="enrollments"
            dataKey="enrollments"
            type="monotone"
            stroke="var(--color-enrollments)"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  );
}
