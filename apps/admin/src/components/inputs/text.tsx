import { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export interface TextInputProps
  extends Omit<ComponentProps<"input">, "onChange" | "value"> {
  error?: string;
  onChange?: (value: string) => void;
  value?: string;
}

export function TextInput({
  className,
  error,
  onChange,
  placeholder,
  value,
  ...props
}: TextInputProps) {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{placeholder}</legend>
      <input
        className={cn("input w-full", error && "input-error", className)}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        value={value}
        {...props}
      />
      {error && <p className="label text-error">{error}</p>}
    </fieldset>
  );
}
