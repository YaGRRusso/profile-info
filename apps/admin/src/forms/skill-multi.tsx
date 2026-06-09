import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import z from "zod";
import { CheckboxInput } from "@/components/inputs/checkbox";
import { RangeInput } from "@/components/inputs/range";
import { SelectInput } from "@/components/inputs/select";
import {
  SkillCategory,
  type UpdateSkillInput,
} from "@/generated/graphql/graphql";
import { fieldError } from "@/lib/field-error";
import { CommonFormProps } from "./common";

const skillMultiSchema = z.object({
  category: z.enum(SkillCategory),
  relevance: z.number().min(1, "must be a positive number"),
});

export type SkillMultiSchema = z.infer<typeof skillMultiSchema>;

export interface SkillMultiFormProps
  extends CommonFormProps<UpdateSkillInput> {}

const CATEGORY_OPTIONS = Object.values(SkillCategory).map((category) => ({
  label: category,
  value: category,
}));

export function SkillMultiForm({
  onSubmit,
  onCancel,
  isDisabled,
  isLoading,
}: SkillMultiFormProps) {
  const [changeCategory, setChangeCategory] = useState(false);
  const [changeRelevance, setChangeRelevance] = useState(false);

  const form = useForm({
    defaultValues: {
      category: SkillCategory.Language,
      relevance: 1,
    },
    onSubmit: ({ value }) => {
      const updateSkillInput: UpdateSkillInput = {};
      if (changeCategory) updateSkillInput.category = value.category;
      if (changeRelevance) updateSkillInput.relevance = value.relevance;
      onSubmit?.(updateSkillInput);
    },
    validators: { onChange: skillMultiSchema },
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
            onChange={(value) => field.handleChange(value as SkillCategory)}
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
              Update Skills
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
