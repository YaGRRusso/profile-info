import { PlusIcon, TrashSimpleIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

export interface FieldArrayProps {
  children: (index: number) => ReactNode;
  error?: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  placeholder?: string;
  values: unknown[];
}

export function FieldArray({
  children,
  error,
  placeholder,
  onAdd,
  onRemove,
  values,
}: FieldArrayProps) {
  return (
    <div className="fieldset gap-2">
      {values.map((_, index) => (
        <div
          className="flex flex-col gap-2 rounded-md bg-base-200 p-4"
          key={index}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold">
              {[placeholder ?? "Item", index + 1].join(" ")}
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
        Add Item
      </button>
      {error && <p className="label text-error">{error}</p>}
    </div>
  );
}
