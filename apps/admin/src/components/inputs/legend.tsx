import { QuestionIcon } from "@phosphor-icons/react";
import { type ComponentProps, type CSSProperties, useId } from "react";
import { cn } from "@/lib/cn";

export interface InputTooltipProps {
  content: string;
}

export function InputTooltip({ content }: InputTooltipProps) {
  const identifier = useId();

  return (
    <>
      <button
        className="btn btn-circle btn-ghost btn-xs -mb-1 -ml-1 inline-flex p-0"
        popoverTarget={identifier}
        style={{ anchorName: `--${identifier}` } as CSSProperties}
        type="button"
      >
        <QuestionIcon size={14} />
      </button>
      <div
        className="dropdown dropdown-hover z-50 max-w-xs rounded bg-neutral p-1 text-neutral-content text-xs"
        id={identifier}
        popover="auto"
        role="tooltip"
        style={{ positionAnchor: `--${identifier}` } as CSSProperties}
      >
        {content}
      </div>
    </>
  );
}

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
      {tooltip && <InputTooltip content={tooltip} />}
    </legend>
  );
}
