import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import z from "zod";
import { CheckboxInput } from "@/components/inputs/checkbox";
import { RangeInput } from "@/components/inputs/range";
import { SelectInput } from "@/components/inputs/select";
import { PLACEHOLDERS } from "@/consts/placeholders";
import {
  OrganizationCategory,
  type UpdateOrganizationInput,
} from "@/generated/graphql/graphql";
import { fieldError } from "@/lib/field-error";
import { CommonFormProps } from "./common";

const organizationMultiSchema = z.object({
  category: z.enum(OrganizationCategory),
  relevance: z.number().min(1, "must be a positive number"),
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
  const [changeCategory, setChangeCategory] = useState(false);
  const [changeRelevance, setChangeRelevance] = useState(false);

  const form = useForm({
    defaultValues: {
      category: OrganizationCategory.Company,
      relevance: 1,
    },
    onSubmit: ({ value }) => {
      const updateOrganizationInput: UpdateOrganizationInput = {};
      if (changeCategory) updateOrganizationInput.category = value.category;
      if (changeRelevance) updateOrganizationInput.relevance = value.relevance;
      onSubmit?.(updateOrganizationInput);
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
        label="Change Category"
        onChange={setChangeCategory}
      />

      <Field name="category">
        {(field) => (
          <SelectInput
            disabled={!changeCategory}
            error={fieldError(field.state.meta)}
            label="Category"
            name={field.name}
            onChange={(value) =>
              field.handleChange(value as OrganizationCategory)
            }
            options={CATEGORY_OPTIONS}
            placeholder={PLACEHOLDERS.chooseCategory}
            value={field.state.value}
          />
        )}
      </Field>

      <div className="divider" />

      <CheckboxInput
        checked={changeRelevance}
        label="Change Relevance"
        onChange={setChangeRelevance}
      />

      <Field name="relevance">
        {(field) => (
          <RangeInput
            className="range-xs"
            disabled={!changeRelevance}
            error={fieldError(field.state.meta)}
            label="Relevance"
            max={5}
            min={1}
            name={field.name}
            onChange={field.handleChange}
            ruler
            step={1}
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
                !(changeCategory || changeRelevance) ||
                isSubmitting ||
                isDisabled ||
                isLoading
              }
              type="submit"
            >
              {(isSubmitting || isLoading) && (
                <span className="loading loading-spinner loading-xs" />
              )}
              Update Organizations
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
