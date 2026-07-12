import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import z from "zod";
import { PasswordInput } from "@/components/inputs/password";
import { TextInput } from "@/components/inputs/text";
import { fieldError } from "@/lib/field-error";
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
  isDisabled,
  isLoading,
}: UserFormProps) {
  const { t: tForm } = useTranslation("forms");

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      ...defaultValues,
    },
    onSubmit: ({ value }) => onSubmit?.(value),
    validators: { onChange: userSchema },
  });

  const { Field, Subscribe } = form;

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Field name="email">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label={tForm("fields.email.label")}
            name={field.name}
            onChange={field.handleChange}
            placeholder={tForm("fields.email.placeholder")}
            tooltip={tForm("fields.email.tooltip")}
            type="email"
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="password">
        {(field) => (
          <PasswordInput
            error={fieldError(field.state.meta)}
            label={tForm("fields.password.label")}
            name={field.name}
            onChange={field.handleChange}
            placeholder={tForm("fields.password.placeholder")}
            tooltip={tForm("fields.password.tooltip")}
            value={field.state.value}
          />
        )}
      </Field>
      <div className="form-footer">
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
              {tForm("submit.signIn")}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
