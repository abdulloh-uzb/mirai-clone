import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card padding="sm" className="gap-1 p-5">
      <p className="text-sm font-bold text-muted-foreground">{label}</p>
      <p className="text-[26px] leading-tight font-extrabold tracking-tight">
        {value}
      </p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}
