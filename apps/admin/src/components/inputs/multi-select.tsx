import { CaretDownIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { AuraField } from "./aura-field";
import { InputLegend } from "./legend";

export interface MultiSelectInputProps {
  ai?: boolean;
  className?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  maxSelected?: number;
  onChange?: (value: string[]) => void;
  optional?: boolean;
  options: { disabled?: boolean; label: string; value: string }[];
  placeholder?: string;
  showSelected?: boolean;
  tooltip?: string;
  value?: string[];
}

export function MultiSelectInput({
  ai,
  className,
  disabled,
  error,
  label,
  onChange,
  optional,
  options,
  placeholder,
  tooltip,
  value = [],
  maxSelected = 50,
  showSelected = true,
}: MultiSelectInputProps) {
  const { t: tAction } = useTranslation("actions");
  const { t: tForm } = useTranslation("forms");
  const containerRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedOptions = options.filter((option) =>
    value.includes(option.value)
  );
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(optionValue: string) {
    const option = options.find((candidate) => candidate.value === optionValue);
    if (option?.disabled && !value.includes(optionValue)) return;

    onChange?.(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue]
    );
  }

  return (
    <fieldset className="fieldset" disabled={disabled}>
      <InputLegend
        ai={ai}
        label={label}
        optional={optional}
        tooltip={tooltip}
      />
      <div className="relative w-full" ref={containerRef}>
        <AuraField disabled={!ai}>
          <label
            className={cn("input w-full", error && "input-error", className)}
          >
            <input
              onChange={(event) => setSearch(event.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder={
                value.length
                  ? tForm("multiSelect.selected", { count: value.length })
                  : placeholder
              }
              type="text"
              value={search}
            />
            <CaretDownIcon />
          </label>
        </AuraField>
        {isOpen && (
          <div className="absolute top-full left-0 z-20 mt-1 flex max-h-64 w-full flex-col gap-2 overflow-auto rounded-box bg-base-200 p-2 shadow">
            <ul className="flex flex-col">
              {filteredOptions.map((option) => (
                <li key={option.value}>
                  <label
                    className={cn(
                      "flex items-center gap-2 rounded p-2 text-sm hover:bg-base-300",
                      option.disabled && !value.includes(option.value)
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer"
                    )}
                  >
                    <input
                      checked={value.includes(option.value)}
                      className="checkbox checkbox-xs"
                      disabled={
                        (option.disabled && !value.includes(option.value)) ||
                        (maxSelected !== undefined &&
                          value.length >= maxSelected &&
                          !value.includes(option.value))
                      }
                      onChange={() => toggle(option.value)}
                      type="checkbox"
                    />
                    <span
                      className={cn(
                        option.disabled &&
                          value.includes(option.value) &&
                          "text-error"
                      )}
                    >
                      {option.label}
                    </span>
                  </label>
                </li>
              ))}
              {!filteredOptions.length && (
                <li className="p-2 text-sm opacity-md">
                  {tForm("multiSelect.noOptions")}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      {showSelected && selectedOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {selectedOptions.map((option) => (
            <button
              className={cn(
                "btn btn-xs btn-soft",
                option.disabled && "text-error"
              )}
              key={option.value}
              onClick={() => toggle(option.value)}
              type="button"
            >
              <span>{option.label}</span>
              <XIcon />
            </button>
          ))}
          <button
            className="btn btn-xs btn-ghost"
            onClick={() => onChange?.([])}
            type="button"
          >
            <span>{tAction("clearAll")}</span>
          </button>
        </div>
      )}
      {error && <p className="label text-error">{error}</p>}
    </fieldset>
  );
}
