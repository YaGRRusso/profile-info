import { type ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { InputLegend } from "./legend";

export interface NumberInputProps
  extends Omit<ComponentProps<"input">, "onChange" | "value"> {
  error?: string;
  label?: string;
  onChange?: (value: number) => void;
  tooltip?: string;
  value?: number;
}

export function NumberInput({
  className,
  error,
  onChange,
  label,
  placeholder,
  tooltip,
  value,
  ...props
}: NumberInputProps) {
  return (
    <fieldset className="fieldset">
      <InputLegend label={label} tooltip={tooltip} />
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
