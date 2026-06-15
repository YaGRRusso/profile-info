import {
  InfinityIcon,
  LineVerticalIcon,
  SparkleIcon,
  TranslateIcon,
} from "@phosphor-icons/react";
import { ComponentProps } from "react";
import { RawSizeEnum } from "@/consts/raw-size";
import { cn } from "@/lib/cn";

export interface TextareaInputProps
  extends Omit<ComponentProps<"textarea">, "onChange" | "value"> {
  error?: string;
  label?: string;
  onChange?: (value: string) => void;
  onOptimize?: () => void;
  onTranslate?: () => void;
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
  disabled,
  value,
  ...props
}: TextareaInputProps) {
  return (
    <fieldset className="fieldset">
      {label && <legend className="fieldset-legend">{label}</legend>}
      <label className="textarea flex w-full cursor-text flex-col gap-2">
        <textarea
          className={cn(
            "max-h-96 min-h-24 resize-y",
            error && "input-error",
            className
          )}
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        {error && <p className="label text-error">{error}</p>}
        <div className="ml-auto flex items-center gap-1">
          {onTranslate && (
            <button
              className="btn btn-xs btn-primary btn-ghost w-fit"
              disabled={
                disabled ||
                !value ||
                !!error ||
                value.trim().length <= RawSizeEnum.XSMALL
              }
              onClick={onTranslate}
              type="button"
            >
              <TranslateIcon />
              Translate with AI
            </button>
          )}
          {onOptimize && (
            <button
              className="btn btn-xs btn-primary btn-ghost w-fit"
              disabled={
                disabled ||
                !value ||
                !!error ||
                value.trim().length <= RawSizeEnum.XSMALL
              }
              onClick={onOptimize}
              type="button"
            >
              <SparkleIcon />
              Optimize with AI
            </button>
          )}
        </div>
      </div>
    </fieldset>
  );
}
