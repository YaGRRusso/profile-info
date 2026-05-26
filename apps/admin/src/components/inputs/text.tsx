import type { AnyFieldApi } from "@tanstack/react-form";
import { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { fieldError } from "@/lib/field-error";

export interface TextInputProps extends ComponentProps<"input"> {
  field: AnyFieldApi;
}

export function TextInput({ className, field, ...props }: TextInputProps) {
  const error = fieldError(field.state.meta);

  return (
    <fieldset className="fieldset">
      <input
        className={cn("input w-full", error && "input-error", className)}
        id={field.name}
        name={field.name}
        onChange={(e) => field.handleChange(e.target.value)}
        value={field.state.value}
        {...props}
      />
      {error && <span className="text-error text-xs">{error}</span>}
    </fieldset>
  );
}
