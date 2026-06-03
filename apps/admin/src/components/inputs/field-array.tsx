import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  TrashSimpleIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { type ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Alert } from "../display/alert";

export interface FieldArrayProps {
  children: (index: number) => ReactNode;
  error?: string;
  label?: string;
  onAdd: () => void;
  onMoveDown?: (index: number) => void;
  onMoveUp?: (index: number) => void;
  onRemove: (index: number) => void;
  sublevel?: boolean;
  values: unknown[];
}

export function FieldArray({
  children,
  error,
  label,
  onAdd,
  onRemove,
  onMoveUp,
  onMoveDown,
  sublevel,
  values,
}: FieldArrayProps) {
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (isMoving) {
      const timeout = setTimeout(() => setIsMoving(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isMoving]);

  return (
    <div className="fieldset gap-2">
      {!values.length && (
        <Alert
          description="Click on the button below to add your first item"
          icon={<WarningIcon />}
          title="Nothing here yet"
        />
      )}
      {values.map((_, index) => (
        <div
          className={cn(
            "flex flex-col gap-2 rounded-md bg-base-200",
            isMoving && "animate-blink",
            !sublevel && "p-4"
          )}
          key={index}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold">
              {[label ?? "Item", index + 1].join(" ")}
            </span>
            <div className="flex gap-1">
              {onMoveUp && (
                <button
                  className="btn btn-ghost btn-sm btn-square"
                  disabled={index === 0}
                  onClick={() => {
                    setIsMoving(true);
                    onMoveUp(index);
                  }}
                  type="button"
                >
                  <ArrowUpIcon />
                </button>
              )}
              {onMoveDown && (
                <button
                  className="btn btn-ghost btn-sm btn-square"
                  disabled={index === values.length - 1}
                  onClick={() => {
                    setIsMoving(true);
                    onMoveDown(index);
                  }}
                  type="button"
                >
                  <ArrowDownIcon />
                </button>
              )}
              <button
                className="btn btn-ghost btn-sm btn-square btn-error"
                onClick={() => onRemove(index)}
                type="button"
              >
                <TrashSimpleIcon />
              </button>
            </div>
          </div>
          {children(index)}
        </div>
      ))}
      <button className="btn btn-soft btn-sm" onClick={onAdd} type="button">
        <PlusIcon />
        {["Add", label ?? "Item"].join(" ")}
      </button>
      {error && <p className="label text-error">{error}</p>}
    </div>
  );
}
