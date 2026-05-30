import { type ComponentProps } from "react";
import { cn } from "@/lib/cn";

export interface NumberInputProps
  extends Omit<ComponentProps<"input">, "onChange" | "value"> {
  error?: string;
  onChange?: (value: number) => void;
  value?: number;
}

export function NumberInput({
  className,
  error,
  onChange,
  placeholder,
  value,
  ...props
}: NumberInputProps) {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{placeholder}</legend>
      <input
        className={cn("input w-full", error && "input-error", className)}
        onChange={(event) => onChange?.(event.target.valueAsNumber)}
        placeholder={placeholder}
        type="number"
        value={value ?? ""}
        {...props}
      />
      {error && <p className="label text-error">{error}</p>}
    </fieldset>
  );
}
