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
  ...props
}: PasswordInputProps) {
  const [isShowing, setIsShowing] = useState(false);
  const error = fieldError(field.state.meta);

  return (
    <div>
      <label className={cn("input w-full", error && "input-error", className)}>
        <input
          id={field.name}
          name={field.name}
          onChange={(e) => field.handleChange(e.target.value)}
          type={isShowing ? "text" : "password"}
          value={field.state.value}
          {...props}
        />
        <button
          className="btn btn-ghost btn-square btn-xs"
          onClick={() => setIsShowing((prev) => !prev)}
          type="button"
        >
          {isShowing ? (
            <EyeSlashIcon className="size-4 opacity-60" />
          ) : (
            <EyeIcon className="size-4 opacity-60" />
          )}
        </button>
      </label>
      {error && <em className="text-error text-xs">{error}</em>}
    </div>
  );
}
