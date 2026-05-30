import { type ComponentProps } from "react";
import { cn } from "@/lib/cn";

export interface CheckboxInputProps
  extends Omit<ComponentProps<"input">, "onChange" | "checked" | "type"> {
  checked?: boolean;
  error?: string;
  label?: string;
  onChange?: (checked: boolean) => void;
}

export function CheckboxInput({
  className,
  checked,
  error,
  label,
  onChange,
  ...props
}: CheckboxInputProps) {
  return (
    <fieldset className="fieldset">
      <label className="flex items-center gap-2 font-semibold text-sm">
        <input
          checked={checked}
          className={cn(
            "checkbox checkbox-sm",
            error && "checkbox-error",
            className
          )}
          onChange={(event) => onChange?.(event.target.checked)}
          type="checkbox"
          {...props}
        />
        {label && <span>{label}</span>}
      </label>
      {error && <p className="label text-error">{error}</p>}
    </fieldset>
  );
}
