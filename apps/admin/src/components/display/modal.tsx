import { XIcon } from "@phosphor-icons/react";
import { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export interface ModalProps extends ComponentProps<"dialog"> {
  description?: string;
  isOpen?: boolean;
  onClose?: () => void;
  title: string;
}

export function Modal({
  title,
  description,
  className,
  children,
  onClose,
  isOpen,
  ...props
}: ModalProps) {
  return (
    isOpen && (
      <dialog
        className={cn(
          "modal modal-open modal-middle max-sm:modal-bottom",
          className
        )}
        {...props}
      >
        <div className="modal-box flex flex-col gap-4">
          <div className="flex flex-col">
            <h2 className="font-semibold text-lg">{title}</h2>
            <p className="text-sm opacity-60">{description}</p>
          </div>
          {children}
          <button
            className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
            onClick={onClose}
            type="button"
          >
            <XIcon />
          </button>
        </div>
        <button className="modal-backdrop" onClick={onClose} type="button">
          close
        </button>
      </dialog>
    )
  );
}
