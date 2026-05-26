import type { AnyFieldApi } from "@tanstack/react-form";
import { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { fieldError } from "@/lib/field-error";

export interface TextInputProps extends ComponentProps<"input"> {
  field: AnyFieldApi;
}

export function TextInput({
  className,
  field,
  placeholder,
  ...props
}: TextInputProps) {
  const error = fieldError(field.state.meta);

  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{placeholder}</legend>
      <input
        className={cn("input w-full", error && "input-error", className)}
        id={field.name}
        name={field.name}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        value={field.state.value}
        {...props}
      />
      {error && <p className="label text-error">{error}</p>}
    </fieldset>
  );
}
