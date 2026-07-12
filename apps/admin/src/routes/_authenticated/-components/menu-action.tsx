import { ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface MenuActionProps extends ComponentProps<"button"> {
  icon: ReactNode;
  label: string;
}

export function MenuAction({
  icon,
  label,
  className,
  type = "button",
  ...props
}: MenuActionProps) {
  return (
    <button
      className={cn(
        "is-drawer-close:tooltip is-drawer-close:tooltip-right",
        className
      )}
      data-tip={label}
      type={type}
      {...props}
    >
      {icon}
      <span className="line-clamp-1 is-drawer-close:hidden">{label}</span>
    </button>
  );
}
