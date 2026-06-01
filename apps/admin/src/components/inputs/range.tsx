import { type ComponentProps, useMemo } from "react";
import { cn } from "@/lib/cn";

export interface RangeInputProps
  extends Omit<ComponentProps<"input">, "onChange" | "value"> {
  error?: string;
  label?: string;
  onChange?: (value: number) => void;
  ruler?: boolean;
  value?: number;
}

export function RangeInput({
  className,
  error,
  min = 0,
  max = 10,
  step = 1,
  onChange,
  placeholder,
  label,
  ruler,
  value,
  ...props
}: RangeInputProps) {
  const steps = useMemo(() => {
    if (!ruler) return;

    const minNum = Number(min);
    const maxNum = Number(max);
    const stepNum = Number(step);

    const values: number[] = [];
    for (let tick = minNum; tick <= maxNum; tick += stepNum) {
      values.push(tick);
    }
    return values;
  }, [min, max, step, ruler]);

  return (
    <fieldset className="fieldset">
      {label && <legend className="fieldset-legend">{label}</legend>}
      <input
        className={cn("range w-full", className)}
        max={max}
        min={min}
        onChange={(event) => onChange?.(event.target.valueAsNumber)}
        type="range"
        value={value ?? ""}
        {...props}
      />
      {ruler && (
        <div className="mt-1 flex justify-between px-2.5 text-xs">
          {steps?.map((tick) => (
            <span
              className={value === tick ? "opacity-full" : "opacity-sm"}
              key={tick}
            >
              {tick}
            </span>
          ))}
        </div>
      )}
      {error && <p className="label text-error">{error}</p>}
    </fieldset>
  );
}
