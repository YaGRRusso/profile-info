import { cn } from "@/lib/cn";

export interface DateRangeValue {
  from: string;
  to: string;
}

export interface DateRangeInputProps {
  className?: string;
  disabled?: boolean;
  error?: string;
  fromLabel?: string;
  onChange?: (value: DateRangeValue) => void;
  placeholder?: string;
  toLabel?: string;
  value?: DateRangeValue;
}

export function DateRangeInput({
  className,
  disabled,
  error,
  fromLabel = "From",
  onChange,
  placeholder,
  toLabel = "To",
  value,
}: DateRangeInputProps) {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{placeholder}</legend>
      <div className="flex items-center gap-2">
        <input
          aria-label={fromLabel}
          className={cn("input w-full", error && "input-error", className)}
          disabled={disabled}
          onChange={(event) =>
            onChange?.({ from: event.target.value, to: value?.to ?? "" })
          }
          type="date"
          value={value?.from ?? ""}
        />
        <input
          aria-label={toLabel}
          className={cn("input w-full", error && "input-error", className)}
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
