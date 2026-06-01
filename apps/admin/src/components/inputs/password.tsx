import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { type ComponentProps, useState } from "react";
import { cn } from "@/lib/cn";

export interface PasswordInputProps
  extends Omit<ComponentProps<"input">, "onChange" | "value"> {
  error?: string;
  label?: string;
  onChange?: (value: string) => void;
  value?: string;
}

export function PasswordInput({
  className,
  error,
  onChange,
  placeholder,
  label,
  value,
  ...props
}: PasswordInputProps) {
  const [isShowing, setIsShowing] = useState(false);

  return (
    <fieldset className="fieldset">
      {label && <legend className="fieldset-legend">{label}</legend>}
      <label className={cn("input w-full", error && "input-error", className)}>
        <input
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          type={isShowing ? "text" : "password"}
          value={value}
          {...props}
        />
        <button
          className="btn btn-ghost btn-square btn-sm -mr-2 text-base"
          onClick={() => setIsShowing((prev) => !prev)}
          type="button"
        >
          {isShowing ? (
            <EyeSlashIcon className="opacity-md" />
          ) : (
            <EyeIcon className="opacity-md" />
          )}
        </button>
      </label>
      {error && <p className="label text-error">{error}</p>}
    </fieldset>
  );
}
