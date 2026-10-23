import { QuestionIcon } from "@phosphor-icons/react";
import { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { FormTooltip } from "./tooltip";

export interface FormDividerProps extends ComponentProps<"div"> {
  label?: string;
  tooltip?: string;
}

export function FormDivider({
  label,
  className,
  tooltip,
  ...props
}: FormDividerProps) {
  return (
    <div className={cn("divider", className)} {...props}>
      {label && (
        <div className="flex items-center gap-1">
          <span>{label}</span>
          {tooltip && (
            <FormTooltip content={tooltip}>
              <QuestionIcon />
            </FormTooltip>
          )}
        </div>
      )}
    </div>
  );
}
