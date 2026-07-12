import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  relevance: z.number().min(1),
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
  const { t: tForm } = useTranslation("forms");
  const { t: tAction } = useTranslation("actions");
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
        label={tForm("batch.changeCategory.label")}
        onChange={setChangeCategory}
        tooltip={tForm("batch.changeCategory.tooltip")}
      />

      <Field name="category">
        {(field) => (
          <SelectInput
            disabled={!changeCategory}
            error={fieldError(field.state.meta)}
            label={tForm("fields.experienceCategory.label")}
            name={field.name}
            onChange={(value) =>
              field.handleChange(value as ExperienceCategory)
            }
            options={CATEGORY_OPTIONS}
            placeholder={tForm("fields.experienceCategory.placeholder")}
            tooltip={tForm("fields.experienceCategory.tooltip")}
            value={field.state.value}
          />
        )}
      </Field>

      <div className="divider" />

      <CheckboxInput
        checked={changeRelevance}
        label={tForm("batch.changeRelevance.label")}
        onChange={setChangeRelevance}
        tooltip={tForm("batch.changeRelevance.tooltip")}
      />

      <Field name="relevance">
        {(field) => (
          <RangeInput
            className="range-xs"
            disabled={!changeRelevance}
            error={fieldError(field.state.meta)}
            label={tForm("fields.relevance.label")}
            max={5}
            min={1}
            name={field.name}
            onChange={field.handleChange}
            ruler
            step={1}
            tooltip={tForm("fields.relevance.tooltip")}
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
              {tForm("submit.updateExperiences")}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
