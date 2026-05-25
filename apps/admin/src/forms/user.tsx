import { useForm } from "@tanstack/react-form";
import z from "zod";
import { cn } from "@/lib/cn";
import { CommonFormProps } from "./common";

const userSchema = z.object({
  username: z.string().min(1, "required"),
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
  const form = useForm({
    defaultValues: {
      username: "",
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
            placeholder="Username"
            type="text"
            value={field.state.value}
          />
        )}
        name="username"
      />
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
            placeholder="Password"
            type="password"
            value={field.state.value}
          />
        )}
        name="password"
      />
      <div className="flex items-center gap-2">
        <Subscribe
          children={({ canSubmit, isSubmitting, isTouched }) => (
            <button
              className="btn btn-soft flex-1"
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
