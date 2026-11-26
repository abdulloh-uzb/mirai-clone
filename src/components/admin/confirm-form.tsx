import { AdminButton } from "@/components/admin/ui/button";
import { AdminField } from "@/components/admin/ui/field";
import { AdminInput } from "@/components/admin/ui/input";

/**
 * A form for a sensitive Admin write. The reason is required (at least 5
 * characters) and is stored in the audit log. `children` are the extra fields.
 */
export function ConfirmForm({
  action,
  hidden,
  submitLabel,
  reasonLabel,
  children,
  tone = "primary",
  layout = "inline",
}: {
  action: (formData: FormData) => Promise<void>;
  hidden: Record<string, string>;
  submitLabel: string;
  reasonLabel: string;
  children?: React.ReactNode;
  tone?: "primary" | "secondary" | "destructive";
  layout?: "inline" | "stacked";
}) {
  const stacked = layout === "stacked";
  return (
    <form
      action={action}
      className={
        stacked ? "flex flex-col gap-3" : "flex flex-wrap items-end gap-3"
      }
    >
      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {children}
      <AdminField
        label={reasonLabel}
        className={stacked ? undefined : "w-full sm:w-64"}
      >
        <AdminInput name="reason" required minLength={5} maxLength={500} />
      </AdminField>
      <AdminButton
        type="submit"
        className={stacked ? "w-fit" : undefined}
        variant={
          tone === "destructive"
            ? "destructive"
            : tone === "secondary"
              ? "outline"
              : "default"
        }
      >
        {submitLabel}
      </AdminButton>
    </form>
  );
}
