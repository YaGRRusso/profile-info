import { QuestionIcon } from "@phosphor-icons/react";
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
    <legend
      className={cn("fieldset-legend justify-start gap-1", className)}
      {...props}
    >
      <span>{label}</span>
      {optional && (
        <FormTooltip
          className="opacity-md"
          content={tForm("labels.optional.tooltip")}
        >
          ({tForm("labels.optional.label")})
        </FormTooltip>
      )}
      {tooltip && (
        <FormTooltip content={tooltip}>
          <QuestionIcon />
        </FormTooltip>
      )}
    </legend>
  );
}
