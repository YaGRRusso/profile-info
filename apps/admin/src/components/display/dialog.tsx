import { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Modal } from "./modal";

export interface DialogProps extends ComponentProps<typeof Modal> {
  actions: {
    icon?: ReactNode;
    label: string;
    onClick: () => void;
    className?: string;
  }[];
}

export function Dialog({ actions, ...props }: DialogProps) {
  return (
    <Modal {...props}>
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
    </Modal>
  );
}
