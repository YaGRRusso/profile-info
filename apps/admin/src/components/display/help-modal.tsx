import { QuestionIcon } from "@phosphor-icons/react";
import { ComponentProps, useState } from "react";
import { cn } from "@/lib/cn";
import { Modal } from "./modal";

export interface HelpModalProps extends ComponentProps<"button"> {
  paragraphs: string[];
  title: string;
}

export function HelpModal({
  title,
  paragraphs,
  className,
  ...props
}: HelpModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        aria-label="help"
        className={cn(
          "btn btn-circle btn-ghost btn-sm -mb-1 shrink-0 text-[1em]",
          className
        )}
        onClick={() => setIsOpen(true)}
        type="button"
        {...props}
      >
        <QuestionIcon />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={title}>
        <div className="flex flex-col gap-2 text-sm leading-relaxed opacity-md">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </Modal>
    </>
  );
}
