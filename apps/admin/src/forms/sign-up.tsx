import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import z from "zod";
import { PasswordInput } from "@/components/inputs/password";
import { TextInput } from "@/components/inputs/text";
import { SLUG_REGEX } from "@/consts/regex";
import { fieldError } from "@/lib/field-error";
import { FormError } from "@/lib/form-errors";
import { CommonFormProps } from "./common";

const signUpSchema = z.object({
  email: z.email(FormError.invalidFormat),
  name: z.string().min(1, FormError.requiredField),
  nickname: z
    .string()
    .regex(SLUG_REGEX, FormError.invalidFormat)
    .or(z.literal("")),
  password: z
    .string()
    .min(1, FormError.requiredField)
    .min(8, FormError.minLength),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;

export interface SignUpFormProps extends CommonFormProps<SignUpSchema> {}

export function SignUpForm({
  onSubmit,
  defaultValues,
  isDisabled,
  isLoading,
}: SignUpFormProps) {
  const { t: tForm } = useTranslation("forms");

  const form = useForm({
    defaultValues: {
      email: "",
      name: "",
      nickname: "",
      password: "",
      ...defaultValues,
    },
    onSubmit: ({ value }) => onSubmit?.(value),
    validators: { onChange: signUpSchema },
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
      <Field name="name">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label={tForm("fields.profileName.label")}
            name={field.name}
            onChange={field.handleChange}
            placeholder={tForm("fields.profileName.placeholder")}
            tooltip={tForm("fields.profileName.tooltip")}
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="nickname">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label={tForm("fields.nickname.label")}
            name={field.name}
            onChange={field.handleChange}
            placeholder={tForm("fields.nickname.placeholder")}
            tooltip={tForm("fields.nickname.tooltip")}
            value={field.state.value}
          />
        )}
      </Field>
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
              {tForm("submit.signUp")}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
