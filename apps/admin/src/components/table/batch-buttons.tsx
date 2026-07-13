import { type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function BatchToolbar({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn("-mb-2 flex justify-end", className)} {...props}>
      <div className="scrollbar-thin flex items-center gap-2 overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

export interface BatchButtonProps
  extends Omit<ComponentProps<"button">, "children" | "type"> {
  icon: ReactNode;
  label: ReactNode;
}

export function BatchButton({
  className,
  icon,
  label,
  ...props
}: BatchButtonProps) {
  return (
    <button
      className={cn("btn btn-ghost btn-sm", className)}
      type="button"
      {...props}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
