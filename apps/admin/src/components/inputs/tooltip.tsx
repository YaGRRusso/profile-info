import { QuestionIcon } from "@phosphor-icons/react";
import { Arrow, Content, Portal, Root, Trigger } from "@radix-ui/react-popover";
import { useState } from "react";

export interface FormTooltipProps {
  content: string;
}

export function FormTooltip({ content }: FormTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <Root onOpenChange={setOpen} open={open}>
      <Trigger asChild>
        <button
          aria-label={content}
          className="btn btn-circle btn-ghost btn-xs -ml-1 inline-flex p-0 text-[1em]"
          type="button"
        >
          <QuestionIcon />
        </button>
      </Trigger>

      <Portal>
        <Content
          className="z-9999 max-w-xs rounded bg-neutral p-2 text-neutral-content text-xs shadow-lg"
          onOpenAutoFocus={(e) => e.preventDefault()}
          side="top"
          sideOffset={5}
        >
          {content}
          <Arrow className="fill-neutral" />
        </Content>
      </Portal>
    </Root>
  );
}
