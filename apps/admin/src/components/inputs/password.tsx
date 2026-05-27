import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { type ComponentProps, useState } from "react";
import { cn } from "@/lib/cn";
import { fieldError } from "@/lib/field-error";

export interface PasswordInputProps extends ComponentProps<"input"> {
  field: AnyFieldApi;
}

export function PasswordInput({
  className,
  field,
  placeholder,
  ...props
}: PasswordInputProps) {
  const [isShowing, setIsShowing] = useState(false);
  const error = fieldError(field.state.meta);

  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{placeholder}</legend>
      <label className={cn("input w-full", error && "input-error", className)}>
        <input
          id={field.name}
          name={field.name}
          onChange={(e) => field.handleChange(e.target.value)}
          placeholder={placeholder}
          type={isShowing ? "text" : "password"}
          value={field.state.value}
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
