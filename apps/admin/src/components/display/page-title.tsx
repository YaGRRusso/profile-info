import { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export interface PageTitleProps extends ComponentProps<"div"> {
  description?: string;
  title: string;
}

export function PageTitle({
  title,
  description,
  className,
  ...props
}: PageTitleProps) {
  return (
    <div className={cn("my-4 flex flex-col", className)} {...props}>
      <h1 className="font-semibold text-3xl">{title}</h1>
      <p className="opacity-60">{description}</p>
    </div>
  );
}
