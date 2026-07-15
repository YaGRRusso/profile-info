import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import z from "zod";
import { CheckboxInput } from "@/components/inputs/checkbox";
import { MultiSelectInput } from "@/components/inputs/multi-select";
import {
  ApiTokenPermission,
  type UpdateApiTokenInput,
} from "@/generated/graphql/graphql";
import { fieldError } from "@/lib/field-error";
import { FormError } from "@/lib/form-errors";
import { CommonFormProps } from "./common";

const apiTokenMultiSchema = z.object({
  permissions: z.array(z.enum(ApiTokenPermission)).min(1, FormError.minCount),
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
  const { t: tForm } = useTranslation("forms");
  const { t: tAction } = useTranslation("actions");
  const [changePermissions, setChangePermissions] = useState(false);

  const form = useForm({
    defaultValues: {
      permissions: Array.of<ApiTokenPermission>(),
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
        label={tForm("batch.changePermissions.label")}
        onChange={setChangePermissions}
        tooltip={tForm("batch.changePermissions.tooltip")}
      />

      <Field name="permissions">
        {(field) => (
          <MultiSelectInput
            disabled={!changePermissions}
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
              {tForm("submit.updateApiTokens")}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
