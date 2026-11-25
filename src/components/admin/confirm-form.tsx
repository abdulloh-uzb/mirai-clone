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
}: {
  action: (formData: FormData) => Promise<void>;
  hidden: Record<string, string>;
  submitLabel: string;
  reasonLabel: string;
  children?: React.ReactNode;
}) {
  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {children}
      <label className="flex flex-col gap-1 text-sm">
        {reasonLabel}
        <input
          name="reason"
          required
          minLength={5}
          maxLength={500}
          className="rounded-md border bg-background px-2 py-1"
        />
      </label>
      <button
        type="submit"
        className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
      >
        {submitLabel}
      </button>
    </form>
  );
}
