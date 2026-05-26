import type { AnyFieldApi } from "@tanstack/react-form";
import { type ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { fieldError } from "@/lib/field-error";

export interface NumberInputProps extends ComponentProps<"input"> {
  field: AnyFieldApi;
}

export function NumberInput({
  className,
  field,
  placeholder,
  ...props
}: NumberInputProps) {
  const error = fieldError(field.state.meta);

  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{placeholder}</legend>
      <input
        className={cn("input w-full", error && "input-error", className)}
        id={field.name}
        name={field.name}
        onChange={(e) => field.handleChange(e.target.valueAsNumber)}
        placeholder={placeholder}
        type="number"
        value={field.state.value ?? ""}
        {...props}
      />
      {error && <p className="label text-error">{error}</p>}
    </fieldset>
  );
}
