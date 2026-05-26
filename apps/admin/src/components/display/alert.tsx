import { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface AlertProps extends ComponentProps<"div"> {
  actions: {
    icon?: ReactNode;
    label: string;
    onClick: () => void;
    className?: string;
  }[];
  description?: string;
  icon?: ReactNode;
  title: string;
}

export function Alert({
  actions,
  title,
  description,
  icon,
  className,
  ...props
}: AlertProps) {
  return (
    <div
      className={cn("alert max-sm:alert-vertical", className)}
      role="alert"
      {...props}
    >
      {icon}
      <div className="flex flex-col">
        <span>{title}</span>
        {description && <p className="opacity-60">{description}</p>}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {actions.map((action, index) => (
            <button
              className={cn("btn btn-soft btn-sm", action.className)}
              key={index}
              onClick={action.onClick}
              type="button"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
