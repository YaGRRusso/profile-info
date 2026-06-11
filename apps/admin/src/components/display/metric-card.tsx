import { Link, type LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface MetricCardProps {
  className?: string;
  href?: LinkProps["to"];
  icon: ReactNode;
  label: string;
  value: number | string;
}

export function MetricCard({
  className,
  href,
  icon,
  label,
  value,
}: MetricCardProps) {
  return (
    <Link
      className={cn(
        "btn btn-block h-auto justify-start gap-4 p-6 normal-case",
        className
      )}
      to={href}
    >
      <div className="flex items-center justify-center rounded bg-primary/10 p-1 text-3xl text-primary">
        {icon}
      </div>
      <div className="flex min-w-0 flex-col items-start">
        <span className="font-bold text-xl tabular-nums">{value}</span>
        <span className="wrap-anywhere line-clamp-1 text-sm opacity-md">
          {label}
        </span>
      </div>
    </Link>
  );
}
