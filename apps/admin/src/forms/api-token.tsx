import { useForm } from "@tanstack/react-form";
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
import { CommonFormProps } from "./common";

const apiTokenSchema = z.object({
  name: z.string().min(1, "required field"),
  permissions: z
    .array(z.enum(ApiTokenPermission))
    .min(1, "select at least one permission"),
  expiresAt: z.string(),
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
    name: data.name,
    permissions: data.permissions,
    expiresAt: toIsoDate(data.expiresAt),
  };
}

export function apiTokenToForm(apiToken: ApiTokenRow): Partial<ApiTokenSchema> {
  return {
    name: apiToken.name,
    permissions: apiToken.permissions,
    expiresAt: toDateInput(apiToken.expiresAt),
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
  const form = useForm({
    defaultValues: {
      name: "",
      permissions: [] as ApiTokenPermission[],
      expiresAt: "",
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
            label="Name"
            name={field.name}
            onChange={field.handleChange}
            placeholder="e.g. CI pipeline"
            value={field.state.value}
          />
        )}
      </Field>

      <Field name="permissions">
        {(field) => (
          <MultiSelectInput
            error={fieldError(field.state.meta)}
            label="Permissions"
            onChange={(value) =>
              field.handleChange(value as ApiTokenPermission[])
            }
            options={PERMISSION_OPTIONS}
            placeholder="Choose permissions"
            value={field.state.value}
          />
        )}
      </Field>

      <Field name="expiresAt">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label="Expires at (optional)"
            name={field.name}
            onChange={field.handleChange}
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
            Cancel
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
              {state === "UPDATING" ? "Update API Token" : "Create API Token"}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
