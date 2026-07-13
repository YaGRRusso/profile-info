export interface FiltersSelectOption {
  count: number;
  label: string;
  value: string;
}

export interface FiltersSelectProps {
  allLabel: string;
  disabled?: boolean;
  onChange: (value: string | null) => void;
  options: FiltersSelectOption[];
  value: string | null;
}

export function FiltersSelect({
  allLabel,
  disabled,
  onChange,
  options,
  value,
}: FiltersSelectProps) {
  return (
    <select
      className="select flex-1 bg-base-200"
      disabled={disabled ?? !options.length}
      onChange={(event) => onChange(event.target.value || null)}
      value={value ?? ""}
    >
      <option value="">{allLabel}</option>
      {options.map(({ value: optionValue, label, count }) => (
        <option key={optionValue} value={optionValue}>
          {label} ({count})
        </option>
      ))}
    </select>
  );
}
