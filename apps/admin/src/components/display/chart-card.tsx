import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface ChartCardProps {
  children: ReactNode;
  className?: string;
  description?: string;
  icon?: ReactNode;
  title: string;
}

export function ChartCard({
  children,
  className,
  description,
  icon,
  title,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-box border border-base-300/40 bg-base-200 p-4",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold">{title}</span>
          {description && (
            <span className="text-sm opacity-md">{description}</span>
          )}
        </div>
      </div>
      <div className="min-h-64 flex-1">{children}</div>
    </div>
  );
}
