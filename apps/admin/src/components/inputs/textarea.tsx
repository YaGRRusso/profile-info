import {
  InfinityIcon,
  LineVerticalIcon,
  SparkleIcon,
  TranslateIcon,
} from "@phosphor-icons/react";
import { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { RawSizeEnum } from "@/consts/raw-size";
import { cn } from "@/lib/cn";
import { hasLength } from "@/lib/has-length";
import { AuraField } from "./aura-field";
import { InputLegend } from "./legend";

export interface TextareaInputProps
  extends Omit<ComponentProps<"textarea">, "onChange" | "value"> {
  ai?: boolean;
  error?: string;
  label?: string;
  onChange?: (value: string) => void;
  onOptimize?: () => void;
  onTranslate?: () => void;
  optional?: boolean;
  tooltip?: string;
  value?: string;
}

export function TextareaInput({
  className,
  error,
  onChange,
  onOptimize,
  onTranslate,
  placeholder,
  label,
  optional,
  tooltip,
  disabled,
  value,
  ai,
  ...props
}: TextareaInputProps) {
  const { t: tForm } = useTranslation("forms");

  const aiDisabled =
    disabled || !!error || !hasLength(value, { min: RawSizeEnum.XSMALL });

  return (
    <fieldset className="fieldset">
      <InputLegend
        ai={ai}
        label={label}
        optional={optional}
        tooltip={tooltip}
      />
      <AuraField disabled={!ai}>
        <label
          className={cn(
            "textarea flex w-full cursor-text flex-col gap-2",
            error && "textarea-error"
          )}
        >
          <textarea
            className={cn("max-h-96 min-h-24 resize-y", className)}
            disabled={disabled}
            onChange={(event) => onChange?.(event.target.value)}
            placeholder={placeholder}
            value={value}
            {...props}
          />
          <span
            className={cn(
              "pointer-events-none flex items-center self-end text-xs opacity-md",
              value?.length === props.maxLength && "text-error"
            )}
          >
            {value?.length ?? 0}
            <LineVerticalIcon />
            {props.maxLength ? props.maxLength : <InfinityIcon weight="bold" />}
          </span>
        </label>
      </AuraField>
      <div className="scrollbar-thin flex items-center justify-between gap-x-4 overflow-x-auto">
        {error && <p className="label text-error">{error}</p>}
        <div className="ml-auto flex items-center gap-1">
          {onTranslate && (
            <button
              className="btn btn-xs group"
              disabled={aiDisabled}
              onClick={onTranslate}
              type="button"
            >
              <TranslateIcon className="text-primary group-disabled:text-base-content/20" />
              <span className="text-animated text-compose group-disabled:bg-none group-disabled:text-base-content/20">
                {tForm("ai.translate")}
              </span>
            </button>
          )}
          {onOptimize && (
            <button
              className="btn btn-xs group"
              disabled={aiDisabled}
              onClick={onOptimize}
              type="button"
            >
              <SparkleIcon className="text-primary group-disabled:text-base-content/20" />
              <span className="text-animated text-compose group-disabled:bg-none group-disabled:text-base-content/20">
                {tForm("ai.optimize")}
              </span>
            </button>
          )}
        </div>
      </div>
    </fieldset>
  );
}
