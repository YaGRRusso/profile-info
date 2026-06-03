import { SparkleIcon } from "@phosphor-icons/react";
import { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export interface TextareaInputProps
  extends Omit<ComponentProps<"textarea">, "onChange" | "value"> {
  error?: string;
  label?: string;
  onChange?: (value: string) => void;
  onOptimize?: () => void;
  value?: string;
}

export function TextareaInput({
  className,
  error,
  onChange,
  onOptimize,
  placeholder,
  label,
  disabled,
  value,
  ...props
}: TextareaInputProps) {
  return (
    <fieldset className="fieldset">
      {label && <legend className="fieldset-legend">{label}</legend>}

      <textarea
        className={cn(
          "textarea max-h-96 min-h-24 w-full resize-y",
          error && "input-error",
          className
        )}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        value={value}
        {...props}
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        {error && <p className="label text-error">{error}</p>}
        {onOptimize && (
          <button
            className="btn btn-xs btn-primary btn-ghost ml-auto w-fit"
            disabled={disabled || !value || value.length < 64 || !!error}
            onClick={onOptimize}
            type="button"
          >
            <SparkleIcon />
            Optimize with AI
          </button>
        )}
      </div>
    </fieldset>
  );
}
