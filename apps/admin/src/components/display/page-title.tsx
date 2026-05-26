import { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface PageTitleProps extends ComponentProps<"div"> {
  actions: {
    icon?: ReactNode;
    label: string;
    onClick: () => void;
    className?: string;
  }[];
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
    <div className="flex flex-wrap items-center justify-between gap-x-8">
      <div className={cn("my-4 flex flex-col", className)} {...props}>
        <h1 className="font-semibold text-3xl">{title}</h1>
        <p className="opacity-60">{description}</p>
      </div>
      {actions && (
        <div className="scrollbar-hidden flex items-center gap-2 overflow-auto">
          {actions.map((action, index) => (
            <button
              className={cn("btn max-sm:btn-sm", action.className)}
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
