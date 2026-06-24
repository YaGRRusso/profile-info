import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import z from "zod";
import { CheckboxInput } from "@/components/inputs/checkbox";
import { MultiSelectInput } from "@/components/inputs/multi-select";
import { PLACEHOLDERS } from "@/consts/placeholders";
import {
  ApiTokenPermission,
  type UpdateApiTokenInput,
} from "@/generated/graphql/graphql";
import { fieldError } from "@/lib/field-error";
import { CommonFormProps } from "./common";

const apiTokenMultiSchema = z.object({
  permissions: z
    .array(z.enum(ApiTokenPermission))
    .min(1, "select at least one permission"),
});

export type ApiTokenMultiSchema = z.infer<typeof apiTokenMultiSchema>;

export interface ApiTokenMultiFormProps
  extends CommonFormProps<UpdateApiTokenInput> {}

const PERMISSION_OPTIONS = Object.values(ApiTokenPermission).map(
  (permission) => ({
    label: permission,
    value: permission,
  })
);

export function ApiTokenMultiForm({
  onSubmit,
  onCancel,
  isDisabled,
  isLoading,
}: ApiTokenMultiFormProps) {
  const [changePermissions, setChangePermissions] = useState(false);

  const form = useForm({
    defaultValues: {
      permissions: [] as ApiTokenPermission[],
    },
    onSubmit: ({ value }) => {
      const updateApiTokenInput: UpdateApiTokenInput = {};
      if (changePermissions)
        updateApiTokenInput.permissions = value.permissions;
      onSubmit?.(updateApiTokenInput);
    },
    validators: { onChange: apiTokenMultiSchema },
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
      <CheckboxInput
        checked={changePermissions}
        label="Change Permissions"
        onChange={setChangePermissions}
      />

      <Field name="permissions">
        {(field) => (
          <MultiSelectInput
            disabled={!changePermissions}
            error={fieldError(field.state.meta)}
            label="Permissions"
            onChange={(value) =>
              field.handleChange(value as ApiTokenPermission[])
            }
            options={PERMISSION_OPTIONS}
            placeholder={PLACEHOLDERS.chooseMulti}
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
          {({ canSubmit, isSubmitting }) => (
            <button
              className="btn btn-soft btn-primary flex-1"
              disabled={
                !canSubmit ||
                !changePermissions ||
                isSubmitting ||
                isDisabled ||
                isLoading
              }
              type="submit"
            >
              {(isSubmitting || isLoading) && (
                <span className="loading loading-spinner loading-xs" />
              )}
              Update API Tokens
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
