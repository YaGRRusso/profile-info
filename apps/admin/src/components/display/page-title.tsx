import { ComponentProps, ReactNode } from "react";
import { HelpModal } from "@/components/display/help-modal";
import { PageHelpContent } from "@/consts/page-help";
import { cn } from "@/lib/cn";

interface ActionProps extends ComponentProps<"button"> {
  icon?: ReactNode;
  label?: string;
}

export interface PageTitleProps extends ComponentProps<"div"> {
  actions?: ActionProps[];
  description?: string;
  help?: PageHelpContent;
  title: string;
}

export function PageTitle({
  title,
  description,
  help,
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
        <div className="flex items-center gap-2 text-4xl">
          <h1 className="font-bold">{title}</h1>
          {help && (
            <HelpModal paragraphs={help.paragraphs} title={help.title} />
          )}
        </div>
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
