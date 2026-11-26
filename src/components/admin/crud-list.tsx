import { PlusIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { AdminBadge } from "@/components/admin/ui/badge";
import { AdminButton } from "@/components/admin/ui/button";
import {
  AdminCard,
  AdminCardDescription,
  AdminCardHeader,
  AdminCardTitle,
} from "@/components/admin/ui/card";
import {
  AdminDisclosure,
  AdminDisclosureList,
} from "@/components/admin/ui/disclosure";
import { AdminEmpty } from "@/components/admin/ui/empty";
import { AdminCheckboxField, AdminField } from "@/components/admin/ui/field";
import { AdminInput } from "@/components/admin/ui/input";
import { AdminSelect } from "@/components/admin/ui/select";
import { AdminTextarea } from "@/components/admin/ui/textarea";
import { deleteRow, saveRow } from "@/lib/admin/content-actions";
import { CRUD, type CrudTable, type Field } from "@/lib/admin/crud";

type Row = Record<string, unknown>;
export type SelectOptions = Record<string, { value: string; label: string }[]>;

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
  const t = useTranslations("Admin.fields");
  if (field.fixed !== undefined) return null;
  const label = t.has(field.name as never)
    ? t(field.name as never)
    : field.name.replaceAll("_", " ");
  if (field.choices) {
    return (
      <AdminField label={label}>
        <AdminSelect
          name={field.name}
          defaultValue={str(value) || field.choices[0]}
        >
          {field.choices.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </AdminSelect>
      </AdminField>
    );
  }
  switch (field.kind) {
    case "bool":
      return (
        <AdminCheckboxField
          name={field.name}
          defaultChecked={Boolean(value)}
          label={label}
          className="self-end sm:h-9"
        />
      );
    case "locale":
      return (
        <AdminField label={label}>
          <AdminSelect name={field.name} defaultValue={str(value) || "en"}>
            {["en", "ja", "es", "ru"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </AdminSelect>
        </AdminField>
      );
    case "select":
      return (
        <AdminField label={label}>
          <AdminSelect name={field.name} defaultValue={str(value)} required>
            {(options ?? []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </AdminSelect>
        </AdminField>
      );
    case "textarea":
    case "json":
      return (
        <AdminField label={label} className="sm:col-span-2">
          <AdminTextarea
            name={field.name}
            defaultValue={str(value)}
            rows={field.kind === "json" ? 4 : 5}
            className="font-mono text-xs"
          />
        </AdminField>
      );
    default:
      return (
        <AdminField label={label}>
          <AdminInput
            name={field.name}
            defaultValue={str(value)}
            type={field.kind === "int" ? "number" : "text"}
          />
        </AdminField>
      );
  }
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
    <form action={saveRow} className="flex flex-col gap-4">
      <input type="hidden" name="_table" value={table} />
      {row ? <input type="hidden" name="_id" value={str(row.id)} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {config.fields.map((f) => (
          <FieldInput
            key={f.name}
            field={f}
            value={row?.[f.name]}
            options={selectOptions?.[f.name]}
          />
        ))}
      </div>
      <AdminButton type="submit" size="sm" className="w-fit">
        {submit}
      </AdminButton>
    </form>
  );
}

/**
 * One table of rows, each editable inline, with a create form. Server-rendered;
 * every submit goes through the audited `saveRow` / `deleteRow` actions.
 */
export function CrudList({
  title,
  description,
  table,
  rows,
  selectOptions,
  allowCreate = true,
  allowDelete = true,
  describe,
}: {
  title: string;
  description?: React.ReactNode;
  table: CrudTable;
  rows: Row[];
  selectOptions?: SelectOptions;
  allowCreate?: boolean;
  allowDelete?: boolean;
  describe?: (row: Row) => string;
}) {
  const config = CRUD[table];
  const t = useTranslations("Admin");
  return (
    <AdminCard className="overflow-hidden">
      <AdminCardHeader>
        <div>
          <AdminCardTitle>{title}</AdminCardTitle>
          {description ? (
            <AdminCardDescription>{description}</AdminCardDescription>
          ) : null}
        </div>
        <AdminBadge>{rows.length}</AdminBadge>
      </AdminCardHeader>
      {rows.length === 0 ? (
        <AdminEmpty title={t("common.nothingYet")} />
      ) : (
        <AdminDisclosureList>
          {rows.map((row) => (
            <AdminDisclosure
              key={str(row.id)}
              summary={
                <>
                  <span className="min-w-0 truncate font-medium">
                    {describe
                      ? describe(row)
                      : [row.locale, str(row[config.titleField])]
                          .filter(Boolean)
                          .join(" · ")}
                  </span>
                  {"published" in row && !row.published ? (
                    <AdminBadge tone="warning">{t("common.draft")}</AdminBadge>
                  ) : null}
                </>
              }
            >
              <RowForm
                table={table}
                row={row}
                selectOptions={selectOptions}
                submit={t("common.save")}
              />
              {allowDelete ? (
                <form
                  action={deleteRow}
                  className="mt-4 flex justify-end border-t pt-4"
                >
                  <input type="hidden" name="_table" value={table} />
                  <input type="hidden" name="_id" value={str(row.id)} />
                  <AdminButton
                    type="submit"
                    variant="destructive-ghost"
                    size="sm"
                  >
                    <Trash2Icon aria-hidden />
                    {t("common.delete")}
                  </AdminButton>
                </form>
              ) : null}
            </AdminDisclosure>
          ))}
        </AdminDisclosureList>
      )}
      {allowCreate ? (
        <div className="border-t">
          <AdminDisclosure
            summary={
              <span className="inline-flex items-center gap-1.5 font-medium text-link">
                <PlusIcon aria-hidden className="size-4" />
                {t("common.newItem", { label: t(`tables.${table}`) })}
              </span>
            }
          >
            <RowForm
              table={table}
              row={null}
              selectOptions={selectOptions}
              submit={t("common.create")}
            />
          </AdminDisclosure>
        </div>
      ) : null}
    </AdminCard>
  );
}
