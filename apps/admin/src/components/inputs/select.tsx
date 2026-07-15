import { type ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { AuraField } from "./aura-field";
import { InputLegend } from "./legend";

export interface SelectInputProps<T extends string = string>
  extends Omit<ComponentProps<"select">, "onChange" | "value"> {
  ai?: boolean;
  error?: string;
  label?: string;
  onChange?: (value: T) => void;
  optional?: boolean;
  options: { disabled?: boolean; label: string; value: T }[];
  placeholder?: string;
  tooltip?: string;
  value?: T;
}

export function SelectInput<T extends string = string>({
  className,
  error,
  onChange,
  options,
  label,
  optional,
  placeholder,
  tooltip,
  value,
  ai,
  ...props
}: SelectInputProps<T>) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <fieldset className="fieldset">
      <InputLegend
        ai={ai}
        label={label}
        optional={optional}
        tooltip={tooltip}
      />
      <AuraField disabled={!ai}>
        <select
          className={cn(
            "select w-full",
            error && "select-error",
            selectedOption?.disabled && "select-error",
            className
          )}
          onChange={(event) => onChange?.(event.target.value as T)}
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
      </AuraField>
      {error && <p className="label text-error">{error}</p>}
    </fieldset>
  );
}
