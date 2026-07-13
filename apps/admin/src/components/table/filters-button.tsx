import { SlidersHorizontalIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

export interface FiltersButtonProps {
  children: ReactNode;
}

export function FiltersButton({ children }: FiltersButtonProps) {
  return (
    <div className="dropdown dropdown-bottom dropdown-end">
      <button className="btn btn-square btn-soft" type="button">
        <SlidersHorizontalIcon />
      </button>
      <div className="dropdown-content z-10 w-52 rounded-box bg-base-200 p-4">
        {children}
      </div>
    </div>
  );
}
