import { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { AuraField } from "./aura-field";
import { InputLegend } from "./legend";

export interface TextInputProps
  extends Omit<ComponentProps<"input">, "onChange" | "value"> {
  ai?: boolean;
  error?: string;
  label?: string;
  onChange?: (value: string) => void;
  optional?: boolean;
  tooltip?: string;
  value?: string;
}

export function TextInput({
  className,
  error,
  onChange,
  placeholder,
  label,
  optional,
  tooltip,
  value,
  ai,
  ...props
}: TextInputProps) {
  return (
    <fieldset className="fieldset">
      <InputLegend
        ai={ai}
        label={label}
        optional={optional}
        tooltip={tooltip}
      />
      <AuraField disabled={!ai}>
        <input
          className={cn("input w-full", error && "input-error", className)}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          value={value}
          {...props}
        />
      </AuraField>
      {error && <p className="label text-error">{error}</p>}
    </fieldset>
  );
}
