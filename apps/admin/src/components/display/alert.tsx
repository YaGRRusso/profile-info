import { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface AlertProps extends ComponentProps<"div"> {
  description?: string;
  icon?: ReactNode;
  title: string;
}

export function Alert({
  title,
  description,
  icon,
  className,
  ...props
}: AlertProps) {
  return (
    <div className={cn("alert", className)} role="alert" {...props}>
      {icon}
      <div className="flex flex-col">
        <span>{title}</span>
        {description && <p className="opacity-md">{description}</p>}
      </div>
    </div>
  );
}
