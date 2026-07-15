export interface FiltersSelectOption<T extends string = string> {
  count: number;
  label: string;
  value: T;
}

export interface FiltersSelectProps<T extends string = string> {
  allLabel: string;
  disabled?: boolean;
  onChange: (value: T | null) => void;
  options: FiltersSelectOption<T>[];
  value: T | null;
}

export function FiltersSelect<T extends string = string>({
  allLabel,
  disabled,
  onChange,
  options,
  value,
}: FiltersSelectProps<T>) {
  return (
    <select
      className="select flex-1 bg-base-200"
      disabled={disabled ?? !options.length}
      onChange={(event) => onChange(event.target.value as T | null)}
      value={value ?? ""}
    >
      <option value="">{allLabel}</option>
      {options.map(({ value: optionValue, label, count }) => (
        <option className="capitalize" key={optionValue} value={optionValue}>
          {label} ({count})
        </option>
      ))}
    </select>
  );
}
