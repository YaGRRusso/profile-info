import { useForm } from "@tanstack/react-form";
import z from "zod";
import { PasswordInput } from "@/components/inputs/password";
import { TextInput } from "@/components/inputs/text";
import { CommonFormProps } from "./common";

const userSchema = z.object({
  email: z.email("invalid email"),
  password: z
    .string()
    .min(1, "required field")
    .min(6, "must be at least 6 characters"),
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
      <Field name="email">
        {(field) => (
          <TextInput field={field} placeholder="Email" type="email" />
        )}
      </Field>
      <Field name="password">
        {(field) => <PasswordInput field={field} placeholder="Password" />}
      </Field>
      <div className="flex items-center gap-2">
        <Subscribe>
          {({ canSubmit, isSubmitting, isTouched }) => (
            <button
              className="btn btn-soft btn-block btn-primary"
              disabled={
                !canSubmit ||
                !isTouched ||
                isSubmitting ||
                isDisabled ||
                isLoading
              }
              type="submit"
            >
              {(isSubmitting || isLoading) && (
                <span className="loading loading-spinner loading-xs" />
              )}
              Sign In
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
