import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import z from "zod";
import { CheckboxInput } from "@/components/inputs/checkbox";
import { SelectInput } from "@/components/inputs/select";
import {
  OrganizationCategory,
  type UpdateOrganizationInput,
} from "@/generated/graphql/graphql";
import { fieldError } from "@/lib/field-error";
import { CommonFormProps } from "./common";

const organizationMultiSchema = z.object({
  category: z.enum(OrganizationCategory),
});

export type OrganizationMultiSchema = z.infer<typeof organizationMultiSchema>;

export interface OrganizationMultiFormProps
  extends CommonFormProps<UpdateOrganizationInput> {}

const CATEGORY_OPTIONS = Object.values(OrganizationCategory).map(
  (category) => ({
    label: category,
    value: category,
  })
);

export function OrganizationMultiForm({
  onSubmit,
  onCancel,
  isDisabled,
  isLoading,
}: OrganizationMultiFormProps) {
  const { t: tForm } = useTranslation("forms");
  const { t: tAction } = useTranslation("actions");
  const [changeCategory, setChangeCategory] = useState(false);

  const form = useForm({
    defaultValues: {
      category: OrganizationCategory.Company,
    },
    onSubmit: ({ value }) => {
      if (!changeCategory) return;
      onSubmit?.({ category: value.category });
    },
    validators: { onChange: organizationMultiSchema },
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
        checked={changeCategory}
        label={tForm("batch.changeCategory.label")}
        onChange={setChangeCategory}
        tooltip={tForm("batch.changeCategory.tooltip")}
      />

      <Field name="category">
        {(field) => (
          <SelectInput
            disabled={!changeCategory}
            error={fieldError(field.state.meta)}
            label={tForm("fields.organizationCategory.label")}
            name={field.name}
            onChange={(value) =>
              field.handleChange(value as OrganizationCategory)
            }
            options={CATEGORY_OPTIONS}
            placeholder={tForm("fields.organizationCategory.placeholder")}
            tooltip={tForm("fields.organizationCategory.tooltip")}
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
                !changeCategory ||
                isSubmitting ||
                isDisabled ||
                isLoading
              }
              type="submit"
            >
              {(isSubmitting || isLoading) && (
                <span className="loading loading-spinner loading-xs" />
              )}
              {tForm("submit.updateOrganizations")}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
