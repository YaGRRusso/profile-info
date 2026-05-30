import { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ActionProps extends ComponentProps<"button"> {
  icon?: ReactNode;
  label: string;
}

export interface AlertProps extends ComponentProps<"div"> {
  actions?: ActionProps[];
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
        {description && <p className="opacity-md">{description}</p>}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {actions.map(({ className, icon, label, ...action }, index) => (
            <button
              className={cn("btn btn-sm", className)}
              key={index}
              type="button"
              {...action}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
