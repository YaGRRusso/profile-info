import { Link, type LinkProps } from "@tanstack/react-router";
import { type ReactNode } from "react";

export interface MenuLinkProps {
  icon: ReactNode;
  label: string;
  to: LinkProps["to"];
  type: "link";
}

export function MenuLink({ icon, label, to }: Omit<MenuLinkProps, "type">) {
  return (
    <Link
      activeProps={{ className: "menu-active" }}
      className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
      data-tip={label}
      to={to}
    >
      {icon}
      <span className="is-drawer-close:hidden">{label}</span>
    </Link>
  );
}
