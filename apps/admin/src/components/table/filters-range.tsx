import { useTranslation } from "react-i18next";

export interface FiltersRangeProps {
  label: string;
  max?: number;
  min?: number;
  onChange: (value: { max?: number; min?: number } | null) => void;
  value: { max?: number; min?: number } | null;
}

export function FiltersRange({
  label,
  min,
  max,
  value,
  onChange,
}: FiltersRangeProps) {
  const { t: tTable } = useTranslation("tables");

  function handleUpdate(bound: "min" | "max", raw: string) {
    const parsed = raw === "" ? undefined : Number(raw);
    const next = {
      min: bound === "min" ? parsed : value?.min,
      max: bound === "max" ? parsed : value?.max,
    };
    onChange(next.min === undefined && next.max === undefined ? null : next);
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <span className="font-semibold">{label}</span>
      <div className="flex items-center gap-2">
        <input
          className="input input-sm w-full"
          max={max ?? 100}
          min={min ?? 0}
          onChange={(event) => handleUpdate("min", event.target.value)}
          placeholder={tTable("rangeMin", { value: min ?? "–" })}
          type="number"
          value={value?.min ?? ""}
        />
        <input
          className="input input-sm w-full"
          max={max ?? 100}
          min={min ?? 0}
          onChange={(event) => handleUpdate("max", event.target.value)}
          placeholder={tTable("rangeMax", { value: max ?? "–" })}
          type="number"
          value={value?.max ?? ""}
        />
      </div>
    </fieldset>
  );
}
