import { type ReactNode } from "react";

export interface MenuActionProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  type: "action";
}

export function MenuAction({
  icon,
  label,
  onClick,
}: Omit<MenuActionProps, "type">) {
  return (
    <button
      className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
      data-tip={label}
      onClick={onClick}
      type="button"
    >
      {icon}
      <span className="line-clamp-1 is-drawer-close:hidden">{label}</span>
    </button>
  );
}
