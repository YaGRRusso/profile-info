import { Link } from "@tanstack/react-router";
import { ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface MenuLinkProps extends ComponentProps<typeof Link> {
  icon: ReactNode;
  label: string;
}

export function MenuLink({ icon, label, className, ...props }: MenuLinkProps) {
  return (
    <Link
      activeProps={{ className: "menu-active" }}
      className={cn(
        "is-drawer-close:tooltip is-drawer-close:tooltip-right",
        className
      )}
      data-tip={label}
      {...props}
    >
      {icon}
      <span className="is-drawer-close:hidden">{label}</span>
    </Link>
  );
}
