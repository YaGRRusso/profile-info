import { type ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { InputLegend } from "./legend";

export interface SelectInputProps
  extends Omit<ComponentProps<"select">, "onChange" | "value"> {
  error?: string;
  label?: string;
  onChange?: (value: string) => void;
  options: { disabled?: boolean; label: string; value: string }[];
  placeholder?: string;
  tooltip?: string;
  value?: string;
}

export function SelectInput({
  className,
  error,
  onChange,
  options,
  label,
  placeholder,
  tooltip,
  value,
  ...props
}: SelectInputProps) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <fieldset className="fieldset">
      <InputLegend label={label} tooltip={tooltip} />
      <select
        className={cn(
          "select w-full",
          error && "select-error",
          selectedOption?.disabled && "select-error",
          className
        )}
        onChange={(event) => onChange?.(event.target.value)}
        value={value ?? ""}
        {...props}
      >
        {placeholder && (
          <option disabled value="">
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            className={cn(
              option.disabled && option.value === value && "text-error"
            )}
            disabled={option.disabled}
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="label text-error">{error}</p>}
    </fieldset>
  );
}
