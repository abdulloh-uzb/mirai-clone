import { deleteRow, saveRow } from "@/lib/admin/content-actions";
import { CRUD, type CrudTable, type Field } from "@/lib/admin/crud";

type Row = Record<string, unknown>;
export type SelectOptions = Record<string, { value: string; label: string }[]>;

const input = "rounded-md border bg-background px-2 py-1 text-sm";

function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return JSON.stringify(v, null, 2);
  return String(v);
}

function FieldInput({
  field,
  value,
  options,
}: {
  field: Field;
  value: unknown;
  options?: { value: string; label: string }[];
}) {
  if (field.fixed !== undefined) return null;
  const label = field.name.replaceAll("_", " ");
  let control: React.ReactNode;
  if (field.choices) {
    control = (
      <select
        name={field.name}
        defaultValue={str(value) || field.choices[0]}
        className={input}
      >
        {field.choices.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
    );
    return (
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">{label}</span>
        {control}
      </label>
    );
  }
  switch (field.kind) {
    case "bool":
      return (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name={field.name}
            defaultChecked={Boolean(value)}
          />
          {label}
        </label>
      );
    case "locale":
      control = (
        <select
          name={field.name}
          defaultValue={str(value) || "en"}
          className={input}
        >
          {["en", "ja", "es", "ru"].map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
      );
      break;
    case "select":
      control = (
        <select
          name={field.name}
          defaultValue={str(value)}
          required
          className={input}
        >
          {(options ?? []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "textarea":
    case "json":
      control = (
        <textarea
          name={field.name}
          defaultValue={str(value)}
          rows={field.kind === "json" ? 4 : 5}
          className={`${input} font-mono`}
        />
      );
      break;
    default:
      control = (
        <input
          name={field.name}
          defaultValue={str(value)}
          type={field.kind === "int" ? "number" : "text"}
          className={input}
        />
      );
  }
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {control}
    </label>
  );
}

function RowForm({
  table,
  row,
  selectOptions,
  submit,
}: {
  table: CrudTable;
  row: Row | null;
  selectOptions?: SelectOptions;
  submit: string;
}) {
  const config = CRUD[table];
  return (
    <form action={saveRow} className="mt-2 flex flex-col gap-3">
      <input type="hidden" name="_table" value={table} />
      {row ? <input type="hidden" name="_id" value={str(row.id)} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {config.fields.map((f) => (
          <FieldInput
            key={f.name}
            field={f}
            value={row?.[f.name]}
            options={selectOptions?.[f.name]}
          />
        ))}
      </div>
      <button
        type="submit"
        className="w-fit rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
      >
        {submit}
      </button>
    </form>
  );
}

/**
 * One table of rows, each editable inline, with a create form. Server-rendered;
 * every submit goes through the audited `saveRow` / `deleteRow` actions.
 */
export function CrudList({
  table,
  rows,
  selectOptions,
  allowCreate = true,
  allowDelete = true,
  describe,
}: {
  table: CrudTable;
  rows: Row[];
  selectOptions?: SelectOptions;
  allowCreate?: boolean;
  allowDelete?: boolean;
  describe?: (row: Row) => string;
}) {
  const config = CRUD[table];
  return (
    <div className="mt-4 flex flex-col gap-2">
      {rows.map((row) => (
        <details key={str(row.id)} className="rounded-md border p-3">
          <summary className="cursor-pointer text-sm font-medium">
            {describe
              ? describe(row)
              : [row.locale, str(row[config.titleField])]
                  .filter(Boolean)
                  .join(" · ")}
            {"published" in row && !row.published ? (
              <span className="ml-2 text-muted-foreground">(draft)</span>
            ) : null}
          </summary>
          <RowForm
            table={table}
            row={row}
            selectOptions={selectOptions}
            submit="Save"
          />
          {allowDelete ? (
            <form action={deleteRow} className="mt-2">
              <input type="hidden" name="_table" value={table} />
              <input type="hidden" name="_id" value={str(row.id)} />
              <button type="submit" className="text-sm text-destructive">
                Delete
              </button>
            </form>
          ) : null}
        </details>
      ))}
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing yet.</p>
      ) : null}
      {allowCreate ? (
        <details className="rounded-md border border-dashed p-3">
          <summary className="cursor-pointer text-sm font-medium">
            New {config.label.toLowerCase()}
          </summary>
          <RowForm
            table={table}
            row={null}
            selectOptions={selectOptions}
            submit="Create"
          />
        </details>
      ) : null}
    </div>
  );
}
