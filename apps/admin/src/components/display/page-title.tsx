import { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ActionProps extends ComponentProps<"button"> {
  icon?: ReactNode;
  label?: string;
}

export interface PageTitleProps extends ComponentProps<"div"> {
  actions?: ActionProps[];
  description?: string;
  title: string;
}

export function PageTitle({
  title,
  description,
  className,
  actions,
  ...props
}: PageTitleProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 gap-x-8",
        className
      )}
      {...props}
    >
      <div className="flex flex-col">
        <h1 className="font-bold text-4xl">{title}</h1>
        <p className="opacity-md">{description}</p>
      </div>
      {actions && (
        <div className="scrollbar-thin flex items-center gap-2 overflow-x-auto">
          {actions.map(({ className, icon, label, ...action }, index) => (
            <button
              className={cn("btn", className)}
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
