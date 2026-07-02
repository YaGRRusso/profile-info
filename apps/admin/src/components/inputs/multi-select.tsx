import { CaretDownIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface MultiSelectInputProps {
  className?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  maxSelected?: number;
  onChange?: (value: string[]) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  showSelected?: boolean;
  value?: string[];
}

export function MultiSelectInput({
  className,
  disabled,
  error,
  label,
  onChange,
  options,
  placeholder,
  value = [],
  maxSelected = 50,
  showSelected = true,
}: MultiSelectInputProps) {
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
    onChange?.(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue]
    );
  }

  return (
    <fieldset className="fieldset" disabled={disabled}>
      {label && <legend className="fieldset-legend">{label}</legend>}
      <div className="relative w-full" ref={containerRef}>
        <label
          className={cn("input w-full", error && "input-error", className)}
        >
          <input
            onChange={(event) => setSearch(event.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={
              value.length ? `${value.length} selected` : placeholder
            }
            type="text"
            value={search}
          />
          <CaretDownIcon />
        </label>
        {isOpen && (
          <div className="absolute top-full left-0 z-20 mt-1 flex max-h-64 w-full flex-col gap-2 overflow-auto rounded-box bg-base-200 p-2 shadow">
            <ul className="flex flex-col">
              {filteredOptions.map((option) => (
                <li key={option.value}>
                  <label className="flex cursor-pointer items-center gap-2 rounded p-2 text-sm hover:bg-base-300">
                    <input
                      checked={value.includes(option.value)}
                      className="checkbox checkbox-xs"
                      disabled={
                        maxSelected !== undefined &&
                        value.length >= maxSelected &&
                        !value.includes(option.value)
                      }
                      onChange={() => toggle(option.value)}
                      type="checkbox"
                    />
                    <span>{option.label}</span>
                  </label>
                </li>
              ))}
              {!filteredOptions.length && (
                <li className="p-2 text-sm opacity-md">No options</li>
              )}
            </ul>
          </div>
        )}
      </div>
      {showSelected && selectedOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {selectedOptions.map((option) => (
            <button
              className="btn btn-xs btn-soft"
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
            <span>clear all</span>
          </button>
        </div>
      )}
      {error && <p className="label text-error">{error}</p>}
    </fieldset>
  );
}
