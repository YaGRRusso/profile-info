import { XIcon } from "@phosphor-icons/react";
import { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ActionProps extends ComponentProps<"button"> {
  icon?: ReactNode;
  label: string;
}

export interface ModalProps extends ComponentProps<"dialog"> {
  actions?: ActionProps[];
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
  actions,
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
            <p className="text-sm opacity-md">{description}</p>
          </div>
          {children}
          <button
            className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
            onClick={onClose}
            type="button"
          >
            <XIcon />
          </button>
          {actions && (
            <div className="flex flex-wrap-reverse items-center gap-2">
              {actions.map((action, index) => (
                <button
                  className={cn("btn flex-1", action.className)}
                  key={index}
                  onClick={action.onClick}
                  type="button"
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="modal-backdrop" onClick={onClose} type="button">
          close
        </button>
      </dialog>
    )
  );
}
