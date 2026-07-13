import { QuestionIcon } from "@phosphor-icons/react";
import { ComponentProps, CSSProperties, useId } from "react";

export interface FormTooltipProps extends ComponentProps<"button"> {
  content: string;
}

export function FormTooltip({ content }: FormTooltipProps) {
  const identifier = useId();

  return (
    <>
      <button
        className="btn btn-circle btn-ghost btn-xs -ml-1 inline-flex p-0 text-[1em]"
        popoverTarget={identifier}
        style={{ anchorName: `--${identifier}` } as CSSProperties}
        type="button"
      >
        <QuestionIcon />
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
