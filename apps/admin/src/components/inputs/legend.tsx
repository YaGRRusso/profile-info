import { QuestionIcon } from "@phosphor-icons/react";
import { ComponentProps } from "react";
import { cn } from "@/lib/cn";

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
      {tooltip && (
        <div className="tooltip before:z-10" data-tip={tooltip}>
          <QuestionIcon className="z-50 -mb-0.5" />
        </div>
      )}
    </legend>
  );
}
