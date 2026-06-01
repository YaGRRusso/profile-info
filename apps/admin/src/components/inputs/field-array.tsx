import { PlusIcon, TrashSimpleIcon, WarningIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Alert } from "../display/alert";

export interface FieldArrayProps {
  children: (index: number) => ReactNode;
  error?: string;
  label?: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  values: unknown[];
}

export function FieldArray({
  children,
  error,
  label,
  onAdd,
  onRemove,
  values,
}: FieldArrayProps) {
  return (
    <div className="fieldset gap-2">
      {!values.length && (
        <Alert
          description="Click on the button below to add your first item"
          icon={<WarningIcon />}
          title="Nothing here yet"
        />
      )}
      {values.map((_, index) => (
        <div
          className="flex flex-col gap-2 rounded-md bg-base-200 p-4"
          key={index}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold">
              {[label ?? "Item", index + 1].join(" ")}
            </span>
            <button
              className="btn btn-ghost btn-sm btn-square btn-error"
              onClick={() => onRemove(index)}
              type="button"
            >
              <TrashSimpleIcon />
            </button>
          </div>
          {children(index)}
        </div>
      ))}
      <button className="btn btn-soft btn-sm" onClick={onAdd} type="button">
        <PlusIcon />
        {["Add", label ?? "Item"].join(" ")}
      </button>
      {error && <p className="label text-error">{error}</p>}
    </div>
  );
}
