import { Arrow, Content, Portal, Root, Trigger } from "@radix-ui/react-popover";
import { ComponentProps, useState } from "react";
import { cn } from "@/lib/cn";

export interface FormTooltipProps extends ComponentProps<"button"> {
  content: string;
}

export function FormTooltip({
  content,
  children,
  className,
  ...props
}: FormTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <Root onOpenChange={setOpen} open={open}>
      <Trigger asChild>
        <button
          aria-label={content}
          className={cn(
            "cursor-pointer text-[1em] transition-colors hover:text-primary",
            className
          )}
          type="button"
          {...props}
        >
          {children}
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
