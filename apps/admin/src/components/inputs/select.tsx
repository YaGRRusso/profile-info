import { type ComponentProps } from "react";
import { cn } from "@/lib/cn";

export interface SelectInputProps
  extends Omit<ComponentProps<"select">, "onChange" | "value"> {
  error?: string;
  onChange?: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  value?: string;
}

export function SelectInput({
  className,
  error,
  onChange,
  options,
  placeholder,
  value,
  ...props
}: SelectInputProps) {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{placeholder}</legend>
      <select
        className={cn("select w-full", error && "select-error", className)}
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
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="label text-error">{error}</p>}
    </fieldset>
  );
}
