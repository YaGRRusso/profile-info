import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export interface AuraFieldProps extends ComponentProps<"div"> {
  disabled?: boolean;
}

export function AuraField({ disabled, children, className }: AuraFieldProps) {
  if (disabled) return children;

  return (
    <div className={cn("aura aura-compose aura-opaque p-px", className)}>
      {children}
    </div>
  );
}
