import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import z from "zod";
import { CheckboxInput } from "@/components/inputs/checkbox";
import { Suggestions } from "@/components/inputs/suggestions";
import { TextInput } from "@/components/inputs/text";
import type { UpdateSkillInput } from "@/generated/graphql/graphql";
import { fieldError } from "@/lib/field-error";
import { CommonFormProps } from "./common";

const skillMultiSchema = z.object({
  category: z.string(),
});

export type SkillMultiSchema = z.infer<typeof skillMultiSchema>;

export interface SkillMultiFormProps extends CommonFormProps<UpdateSkillInput> {
  categoriesList?: string[];
}

export function SkillMultiForm({
  categoriesList = [],
  onSubmit,
  onCancel,
  isDisabled,
  isLoading,
}: SkillMultiFormProps) {
  const { t: tForm } = useTranslation("forms");
  const { t: tAction } = useTranslation("actions");
  const [changeCategory, setChangeCategory] = useState(false);

  const form = useForm({
    defaultValues: {
      category: "",
    },
    onSubmit: ({ value }) => {
      if (!changeCategory) return;
      onSubmit?.({ category: value.category });
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
        label={tForm("batch.changeCategory.label")}
        onChange={setChangeCategory}
        tooltip={tForm("batch.changeCategory.tooltip")}
      />

      <Field name="category">
        {(field) => (
          <Suggestions
            items={categoriesList}
            onSelect={field.handleChange}
            value={field.state.value ?? ""}
          >
            <TextInput
              disabled={!changeCategory}
              error={fieldError(field.state.meta)}
              label={tForm("fields.skillCategory.label")}
              name={field.name}
              onChange={field.handleChange}
              placeholder={tForm("fields.skillCategory.placeholder")}
              tooltip={tForm("fields.skillCategory.tooltip")}
              value={field.state.value ?? ""}
            />
          </Suggestions>
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
              {tForm("submit.updateSkills")}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
