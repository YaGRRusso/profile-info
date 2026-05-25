import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import z from "zod";
import { cn } from "@/lib/cn";
import { CommonFormProps } from "./common";

const userSchema = z.object({
  email: z.string().email("invalid email"),
  password: z.string().min(1, "required"),
});

export type UserSchema = z.infer<typeof userSchema>;

export interface UserFormProps extends CommonFormProps<UserSchema> {}

export function UserForm({
  onSubmit,
  defaultValues,
  customValues,
  isDisabled,
  isLoading,
}: UserFormProps) {
  const [isShowingPassword, setIsShowingPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      ...defaultValues,
    },
    onSubmit: ({ value }) => onSubmit?.({ ...value, ...customValues }),
    validators: { onChange: userSchema },
  });

  const { Field, Subscribe } = form;

  return (
    <form
      className="flex w-full flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Field
        children={(field) => (
          <input
            className={cn(
              "input w-full",
              field.state.meta.isTouched &&
                !field.state.meta.isValid &&
                "input-error"
            )}
            id={field.name}
            name={field.name}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder="Email"
            type="email"
            value={field.state.value}
          />
        )}
        name="email"
      />
      <Field
        children={(field) => (
          <label
            className={cn(
              "input w-full",
              field.state.meta.isTouched &&
                !field.state.meta.isValid &&
                "input-error"
            )}
          >
            <input
              id={field.name}
              name={field.name}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Password"
              type={isShowingPassword ? "text" : "password"}
              value={field.state.value}
            />
            <button
              className="btn btn-ghost btn-square btn-xs"
              onClick={() => setIsShowingPassword((prev) => !prev)}
              type="button"
            >
              {isShowingPassword ? (
                <EyeSlashIcon className="size-4 opacity-50" />
              ) : (
                <EyeIcon className="size-4 opacity-50" />
              )}
            </button>
          </label>
        )}
        name="password"
      />
      <div className="flex items-center gap-2">
        <Subscribe
          children={({ canSubmit, isSubmitting, isTouched }) => (
            <button
              className="btn btn-soft btn-block"
              disabled={
                !canSubmit ||
                !isTouched ||
                isSubmitting ||
                isDisabled ||
                isLoading
              }
              type="submit"
            >
              Submit
            </button>
          )}
        />
      </div>
    </form>
  );
}
