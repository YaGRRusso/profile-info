import { cn } from "@/lib/cn";
import { InputLegend } from "./legend";

export interface DateRangeValue {
  from: string;
  to: string;
}

export interface DateRangeInputProps {
  className?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  onChange?: (value: DateRangeValue) => void;
  tooltip?: string;
  value?: DateRangeValue;
}

export function DateRangeInput({
  className,
  disabled,
  error,
  onChange,
  label,
  tooltip,
  value,
}: DateRangeInputProps) {
  return (
    <fieldset className="fieldset">
      <InputLegend label={label} tooltip={tooltip} />
      <div className="flex flex-wrap items-center gap-2">
        <input
          aria-label="From"
          className={cn("input flex-1", error && "input-error", className)}
          disabled={disabled}
          onChange={(event) =>
            onChange?.({ from: event.target.value, to: value?.to ?? "" })
          }
          type="date"
          value={value?.from ?? ""}
        />
        <input
          aria-label="To"
          className={cn("input flex-1", error && "input-error", className)}
          disabled={disabled}
          onChange={(event) =>
            onChange?.({ from: value?.from ?? "", to: event.target.value })
          }
          type="date"
          value={value?.to ?? ""}
        />
      </div>
      {error && <p className="label text-error">{error}</p>}
    </fieldset>
  );
}
