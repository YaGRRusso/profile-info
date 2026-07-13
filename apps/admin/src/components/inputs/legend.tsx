import { type ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { FormTooltip } from "./tooltip";

export interface InputLegendProps extends ComponentProps<"legend"> {
  label?: string;
  optional?: boolean;
  tooltip?: string;
}

export function InputLegend({
  className,
  label,
  tooltip,
  optional,
  ...props
}: InputLegendProps) {
  const { t: tForm } = useTranslation("forms");

  if (!label) return null;

  return (
    <legend className={cn("fieldset-legend gap-1", className)} {...props}>
      <span>{label}</span>
      {optional && (
        <span className="font-normal text-xs opacity-md">
          ({tForm("optional")})
        </span>
      )}
      {tooltip && <FormTooltip content={tooltip} />}
    </legend>
  );
}
