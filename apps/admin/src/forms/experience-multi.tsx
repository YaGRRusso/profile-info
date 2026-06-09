import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import z from "zod";
import { CheckboxInput } from "@/components/inputs/checkbox";
import { RangeInput } from "@/components/inputs/range";
import { SelectInput } from "@/components/inputs/select";
import {
  ExperienceCategory,
  type UpdateExperienceInput,
} from "@/generated/graphql/graphql";
import { fieldError } from "@/lib/field-error";
import { CommonFormProps } from "./common";

const experienceMultiSchema = z.object({
  category: z.enum(ExperienceCategory),
  relevance: z.number().min(1, "must be a positive number"),
});

export type ExperienceMultiSchema = z.infer<typeof experienceMultiSchema>;

export interface ExperienceMultiFormProps
  extends CommonFormProps<UpdateExperienceInput> {}

const CATEGORY_OPTIONS = Object.values(ExperienceCategory).map((category) => ({
  label: category,
  value: category,
}));

export function ExperienceMultiForm({
  onSubmit,
  onCancel,
  isDisabled,
  isLoading,
}: ExperienceMultiFormProps) {
  const [changeCategory, setChangeCategory] = useState(false);
  const [changeRelevance, setChangeRelevance] = useState(false);

  const form = useForm({
    defaultValues: {
      category: ExperienceCategory.FullTime,
      relevance: 1,
    },
    onSubmit: ({ value }) => {
      const updateExperienceInput: UpdateExperienceInput = {};
      if (changeCategory) updateExperienceInput.category = value.category;
      if (changeRelevance) updateExperienceInput.relevance = value.relevance;
      onSubmit?.(updateExperienceInput);
    },
    validators: { onChange: experienceMultiSchema },
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
              field.handleChange(value as ExperienceCategory)
            }
            options={CATEGORY_OPTIONS}
            placeholder="Category"
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
            placeholder="Relevance"
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
              Update Experiences
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
