import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import z from "zod";
import { PasswordInput } from "@/components/inputs/password";
import { SelectInput } from "@/components/inputs/select";
import { TextInput } from "@/components/inputs/text";
import { SLUG_REGEX } from "@/consts/regex";
import {
  type CreateUserInput,
  type UpdateUserInput,
  UserRole,
} from "@/generated/graphql/graphql";
import type { UserRow } from "@/hooks/queries/users";
import { fieldError } from "@/lib/field-error";
import { FormError } from "@/lib/form-errors";
import { omitIfEmpty } from "@/lib/form-input";
import { CommonFormProps } from "./common";

const userSchema = z.object({
  email: z.email(FormError.invalidFormat),
  name: z.string().min(1, FormError.requiredField),
  nickname: z
    .string()
    .regex(SLUG_REGEX, FormError.invalidFormat)
    .or(z.literal("")),
  password: z.union([z.literal(""), z.string().min(8, FormError.minLength)]),
  role: z.enum(UserRole, FormError.requiredField),
});

export type UserSchema = z.infer<typeof userSchema>;

export interface UserFormProps extends CommonFormProps<UserSchema> {}

const ROLE_OPTIONS = Object.values(UserRole).map((role) => ({
  label: role,
  value: role,
}));

export function userToForm(user: UserRow): Partial<UserSchema> {
  return {
    email: user.email,
    name: user.name,
    nickname: user.nickname,
    password: "",
    role: user.role,
  };
}

export function userToCreateInput(data: UserSchema): CreateUserInput {
  return {
    email: data.email,
    name: data.name,
    nickname: data.nickname,
    password: data.password,
    role: data.role,
  };
}

export function userToUpdateInput(data: UserSchema): UpdateUserInput {
  return {
    email: data.email,
    name: data.name,
    nickname: data.nickname,
    password: omitIfEmpty(data.password),
    role: data.role,
  };
}

export function UserForm({
  onSubmit,
  onCancel,
  defaultValues,
  isDisabled,
  isLoading,
  state,
}: UserFormProps) {
  const { t: tForm } = useTranslation("forms");
  const { t: tAction } = useTranslation("actions");

  const form = useForm({
    defaultValues: {
      email: "",
      name: "",
      nickname: "",
      password: "",
      role: UserRole.User,
      ...defaultValues,
    },
    onSubmit: ({ value }) => onSubmit?.(value),
    validators: { onChange: userSchema },
  });

  const { Field, Subscribe } = form;

  return (
    <form
      className="form"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
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
      <Field name="role">
        {(field) => (
          <SelectInput
            error={fieldError(field.state.meta)}
            label={tForm("fields.userRole.label")}
            name={field.name}
            onChange={field.handleChange}
            options={ROLE_OPTIONS}
            placeholder={tForm("fields.userRole.placeholder")}
            tooltip={tForm("fields.userRole.tooltip")}
            value={field.state.value}
          />
        )}
      </Field>
      <div className="form-footer">
        {onCancel && (
          <button
            className="btn btn-ghost flex-1"
            onClick={onCancel}
            type="button"
          >
            {tAction("cancel")}
          </button>
        )}
        <Subscribe>
          {({ canSubmit, isSubmitting, isTouched }) => (
            <button
              className="btn btn-soft btn-primary flex-1"
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
              {state === "UPDATING"
                ? tForm("submit.updateUser")
                : tForm("submit.createUser")}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
