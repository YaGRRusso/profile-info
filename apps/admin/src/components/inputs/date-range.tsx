import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t: tForm } = useTranslation("forms");
  const [current, setCurrent] = useState(false);

  const handleChange = useCallback(
    (patch: { from?: string; to?: string; current?: boolean }) => {
      const from = patch.from ?? value?.from ?? "";
      const to = patch.to ?? value?.to ?? "";

      return onChange?.({
        from,
        to: patch.current ? "" : to,
      });
    },
    [onChange, value?.from, value?.to]
  );

  return (
    <fieldset className="fieldset">
      <InputLegend label={label} tooltip={tooltip} />
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <input
            className={cn("input flex-1", error && "input-error", className)}
            disabled={disabled}
            onChange={(event) =>
              handleChange({ from: event.target.value, current })
            }
            type="date"
            value={value?.from ?? ""}
          />
          <input
            className={cn("input flex-1", error && "input-error", className)}
            disabled={disabled || current}
            onChange={(event) =>
              handleChange({ to: event.target.value, current })
            }
            type="date"
            value={value?.to ?? ""}
          />
        </div>
        <label className="label cursor-pointer justify-end">
          {tForm("dateRange.current")}
          <input
            checked={current}
            className="toggle toggle-sm"
            disabled={disabled}
            onChange={(event) => {
              setCurrent(event.target.checked);
              handleChange({ current: event.target.checked });
            }}
            type="checkbox"
          />
        </label>
      </div>
      {error && <p className="label text-error">{error}</p>}
    </fieldset>
  );
}
