import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  QuestionIcon,
  TrashSimpleIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { Alert } from "../display/alert";
import { FormTooltip } from "./tooltip";

export interface FieldArrayProps {
  children: (index: number) => ReactNode;
  error?: string;
  label?: string;
  onAdd: () => void;
  onMoveDown?: (index: number) => void;
  onMoveUp?: (index: number) => void;
  onRemove: (index: number) => void;
  sublevel?: boolean;
  tooltip?: string;
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
  tooltip,
  values,
}: FieldArrayProps) {
  const { t: tForm } = useTranslation("forms");
  const itemLabel = label ?? tForm("fieldArray.item");

  return (
    <div>
      <div className="fieldset gap-2" key={JSON.stringify(values)}>
        {!values.length && (
          <Alert
            description={tForm("fieldArray.emptyDescription")}
            icon={<WarningIcon />}
            title={tForm("fieldArray.emptyTitle")}
          />
        )}
        {values.map((_, index) => (
          <div
            className={cn(
              "flex flex-col gap-2 rounded-md bg-base-200",
              sublevel ? "bg-base-100 p-4" : "p-4"
            )}
            key={index}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-semibold">
                {[itemLabel, index + 1].join(" ")}
                {tooltip && (
                  <FormTooltip content={tooltip}>
                    <QuestionIcon className="size-4 opacity-70" />
                  </FormTooltip>
                )}
              </span>
              <div className="flex gap-1">
                {onMoveUp && (
                  <button
                    className="btn btn-ghost btn-sm btn-square"
                    disabled={index === 0}
                    onClick={() => {
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
          {tForm("fieldArray.addItem", { item: itemLabel })}
        </button>
        {error && <p className="label text-error">{error}</p>}
      </div>
    </div>
  );
}
