export const DATE_FILTER_OPTIONS = [
  { label: "Any date", value: "" },
  { label: "Last 7 days", value: "week" },
  { label: "This month", value: "month" },
] as const;

export interface FiltersRadioOption {
  label: string;
  value: string;
}

export interface FiltersRadioProps {
  label: string;
  name: string;
  onChange: (value: string | null) => void;
  options: readonly FiltersRadioOption[];
  value: string | null;
}

export function FiltersRadio({
  label,
  name,
  options,
  value,
  onChange,
}: FiltersRadioProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <span className="font-semibold">{label}</span>
      {options.map(({ value: optionValue, label: optionLabel }) => (
        <label className="flex items-center gap-2 text-sm" key={optionValue}>
          <input
            checked={value === optionValue || (!value && optionValue === "")}
            className="radio radio-sm"
            name={name}
            onChange={() => onChange(optionValue || null)}
            type="radio"
            value={optionValue}
          />
          <span className="capitalize">{optionLabel}</span>
        </label>
      ))}
    </fieldset>
  );
}
