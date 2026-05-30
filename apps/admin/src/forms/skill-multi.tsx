import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import z from "zod";
import { RangeInput } from "@/components/inputs/range";
import { SelectInput } from "@/components/inputs/select";
import { SkillCategory, type UpdateSkillInput } from "@/graphql/graphql";
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
      <label className="mt-2 flex items-center gap-2 font-semibold text-sm">
        <input
          checked={changeCategory}
          className="checkbox checkbox-xs"
          onChange={(event) => setChangeCategory(event.target.checked)}
          type="checkbox"
        />
        <span className="text-sm">Change Category</span>
      </label>

      <Field name="category">
        {(field) => (
          <SelectInput
            disabled={!changeCategory}
            field={field}
            options={CATEGORY_OPTIONS}
            placeholder="Category"
          />
        )}
      </Field>

      <label className="mt-2 flex items-center gap-2 font-semibold text-sm">
        <input
          checked={changeRelevance}
          className="checkbox checkbox-xs"
          onChange={(event) => setChangeRelevance(event.target.checked)}
          type="checkbox"
        />
        <span className="text-sm">Change Relevance</span>
      </label>

      <Field name="relevance">
        {(field) => (
          <RangeInput
            className="range-xs"
            disabled={!changeRelevance}
            field={field}
            max={5}
            min={1}
            placeholder="Relevance"
            ruler
            step={1}
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
