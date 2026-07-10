import { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { InputLegend } from "./legend";

export interface TextInputProps
  extends Omit<ComponentProps<"input">, "onChange" | "value"> {
  error?: string;
  label?: string;
  onChange?: (value: string) => void;
  tooltip?: string;
  value?: string;
}

export function TextInput({
  className,
  error,
  onChange,
  placeholder,
  label,
  tooltip,
  value,
  ...props
}: TextInputProps) {
  return (
    <fieldset className="fieldset">
      <InputLegend label={label} tooltip={tooltip} />
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
