import { GearIcon } from "@phosphor-icons/react";
import type { Column } from "@tanstack/react-table";

export interface VisibilityButtonProps<T> {
  columns: Column<T, unknown>[];
}

export function VisibilityButton<T>({ columns }: VisibilityButtonProps<T>) {
  return (
    <div className="dropdown dropdown-bottom dropdown-end">
      <button className="btn btn-square btn-soft" type="button">
        <GearIcon />
      </button>
      <div className="dropdown-content z-10 w-40 rounded-box bg-base-200 p-4">
        <div className="flex flex-col gap-2">
          <span className="font-semibold">Visibility</span>
          {columns
            .filter((col) => col.getCanHide())
            .map((col) => (
              <label className="flex items-center gap-2 text-sm" key={col.id}>
                <input
                  checked={col.getIsVisible()}
                  className="checkbox checkbox-sm"
                  onChange={col.getToggleVisibilityHandler()}
                  type="checkbox"
                />
                <span>{col.columnDef.header as string}</span>
              </label>
            ))}
        </div>
      </div>
    </div>
  );
}
