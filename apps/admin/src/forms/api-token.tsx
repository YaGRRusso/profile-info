import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import z from "zod";
import { MultiSelectInput } from "@/components/inputs/multi-select";
import { TextInput } from "@/components/inputs/text";
import {
  ApiTokenPermission,
  type CreateApiTokenInput,
} from "@/generated/graphql/graphql";
import type { ApiTokenRow } from "@/hooks/queries/api-tokens";
import { toDateInput, toIsoDate } from "@/lib/date";
import { fieldError } from "@/lib/field-error";
import { FormError } from "@/lib/form-errors";
import { nullIfEmpty } from "@/lib/form-input";
import { CommonFormProps } from "./common";

const apiTokenSchema = z.object({
  expiresAt: z.string(),
  name: z.string().min(1, FormError.requiredField),
  permissions: z.array(z.enum(ApiTokenPermission)).min(1, FormError.minCount),
});

export type ApiTokenSchema = z.infer<typeof apiTokenSchema>;

export interface ApiTokenFormProps extends CommonFormProps<ApiTokenSchema> {}

const PERMISSION_OPTIONS = Object.values(ApiTokenPermission).map(
  (permission) => ({
    label: permission,
    value: permission,
  })
);

export function apiTokenToInput(data: ApiTokenSchema): CreateApiTokenInput {
  return {
    expiresAt: nullIfEmpty(toIsoDate(data.expiresAt)),
    name: data.name,
    permissions: data.permissions,
  };
}

export function apiTokenToForm(apiToken: ApiTokenRow): Partial<ApiTokenSchema> {
  return {
    expiresAt: toDateInput(apiToken.expiresAt),
    name: apiToken.name,
    permissions: apiToken.permissions,
  };
}

export function ApiTokenForm({
  onSubmit,
  onCancel,
  defaultValues,
  isDisabled,
  isLoading,
  state,
}: ApiTokenFormProps) {
  const { t: tForm } = useTranslation("forms");
  const { t: tAction } = useTranslation("actions");

  const form = useForm({
    defaultValues: {
      expiresAt: "",
      name: "",
      permissions: Array.of<ApiTokenPermission>(),
      ...defaultValues,
    },
    onSubmit: ({ value }) => onSubmit?.(value),
    validators: { onChange: apiTokenSchema },
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
            label={tForm("fields.apiTokenName.label")}
            name={field.name}
            onChange={field.handleChange}
            placeholder={tForm("fields.apiTokenName.placeholder")}
            tooltip={tForm("fields.apiTokenName.tooltip")}
            value={field.state.value}
          />
        )}
      </Field>

      <Field name="permissions">
        {(field) => (
          <MultiSelectInput
            error={fieldError(field.state.meta)}
            label={tForm("fields.permissions.label")}
            onChange={field.handleChange}
            options={PERMISSION_OPTIONS}
            placeholder={tForm("fields.permissions.placeholder")}
            tooltip={tForm("fields.permissions.tooltip")}
            value={field.state.value}
          />
        )}
      </Field>

      <Field name="expiresAt">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label={tForm("fields.expiresAt.label")}
            name={field.name}
            onChange={field.handleChange}
            optional
            tooltip={tForm("fields.expiresAt.tooltip")}
            type="date"
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
                ? tForm("submit.updateApiToken")
                : tForm("submit.createApiToken")}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
