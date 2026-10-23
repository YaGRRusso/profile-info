import { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export interface ViewCellProps extends ComponentProps<"button"> {}

export function ViewCell({ children, className, ...props }: ViewCellProps) {
  return (
    <button
      className={cn(
        "group flex cursor-pointer items-center gap-1 text-left hover:underline",
        className
      )}
      type="button"
      {...props}
    >
      <span className="line-clamp-1 flex-1">{children}</span>
      {/* <EyeIcon className="mt-1 opacity-0 transition-all group-hover:opacity-100" /> */}
    </button>
  );
}
