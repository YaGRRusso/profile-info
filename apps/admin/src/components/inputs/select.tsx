import type { AnyFieldApi } from "@tanstack/react-form";
import { type ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { fieldError } from "@/lib/field-error";

export interface SelectInputProps extends ComponentProps<"select"> {
  field: AnyFieldApi;
  options: { label: string; value: string }[];
  placeholder?: string;
}

export function SelectInput({
  className,
  field,
  options,
  placeholder,
  ...props
}: SelectInputProps) {
  const error = fieldError(field.state.meta);

  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{placeholder}</legend>
      <select
        className={cn("select w-full", error && "select-error", className)}
        id={field.name}
        name={field.name}
        onChange={(e) => field.handleChange(e.target.value)}
        value={field.state.value ?? ""}
        {...props}
      >
        {placeholder && <option disabled>{placeholder}</option>}
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
