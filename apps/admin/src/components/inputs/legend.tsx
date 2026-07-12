import { type ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { FormTooltip } from "./tooltip";

export interface InputLegendProps extends ComponentProps<"legend"> {
  label?: string;
  tooltip?: string;
}

export function InputLegend({
  className,
  label,
  tooltip,
  ...props
}: InputLegendProps) {
  if (!label) return null;

  return (
    <legend className={cn("fieldset-legend", className)} {...props}>
      <span>{label}</span>
      {tooltip && <FormTooltip content={tooltip} />}
    </legend>
  );
}
