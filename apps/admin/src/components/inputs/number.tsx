import { type ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { AuraField } from "./aura-field";
import { InputLegend } from "./legend";

export interface NumberInputProps
  extends Omit<ComponentProps<"input">, "onChange" | "value"> {
  ai?: boolean;
  error?: string;
  label?: string;
  onChange?: (value: number) => void;
  optional?: boolean;
  tooltip?: string;
  value?: number;
}

export function NumberInput({
  className,
  error,
  onChange,
  label,
  optional,
  placeholder,
  tooltip,
  value,
  ai,
  ...props
}: NumberInputProps) {
  return (
    <fieldset className="fieldset">
      <InputLegend label={label} optional={optional} tooltip={tooltip} />
      <AuraField disabled={!ai}>
        <input
          className={cn("input w-full", error && "input-error", className)}
          onChange={(event) => onChange?.(event.target.valueAsNumber)}
          placeholder={placeholder}
          type="number"
          value={value ?? ""}
          {...props}
        />
      </AuraField>
      {error && <p className="label text-error">{error}</p>}
    </fieldset>
  );
}
