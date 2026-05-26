import type { AnyFieldApi } from "@tanstack/react-form";
import { type ComponentProps, useMemo } from "react";
import { cn } from "@/lib/cn";
import { fieldError } from "@/lib/field-error";

export interface RangeInputProps extends ComponentProps<"input"> {
  field: AnyFieldApi;
  ruler?: boolean;
}

export function RangeInput({
  className,
  field,
  min = 0,
  max = 10,
  step = 1,
  placeholder,
  ruler,
  ...props
}: RangeInputProps) {
  const error = fieldError(field.state.meta);

  const steps = useMemo(() => {
    if (!ruler) return;

    const minNum = Number(min);
    const maxNum = Number(max);
    const stepNum = Number(step);

    const values: number[] = [];
    for (let i = minNum; i <= maxNum; i += stepNum) {
      values.push(i);
    }
    return values;
  }, [min, max, step, ruler]);

  return (
    <fieldset className="fieldset">
      <input
        className={cn("range w-full", className)}
        id={field.name}
        max={max}
        min={min}
        name={field.name}
        onChange={(e) => field.handleChange(e.target.valueAsNumber)}
        type="range"
        value={field.state.value ?? ""}
        {...props}
      />
      {ruler && (
        <div className="mt-1 flex justify-between px-2.5 text-xs">
          {steps?.map((value) => (
            <span
              className={
                field.state.value === value ? "opacity-100" : "opacity-20"
              }
              key={value}
            >
              {value}
            </span>
          ))}
        </div>
      )}
      {error && <span className="text-error text-xs">{error}</span>}
    </fieldset>
  );
}
