import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import z from "zod";
import { CheckboxInput } from "@/components/inputs/checkbox";
import { TextInput } from "@/components/inputs/text";
import { PLACEHOLDERS } from "@/consts/placeholders";
import type { UpdateSkillInput } from "@/generated/graphql/graphql";
import { fieldError } from "@/lib/field-error";
import { CommonFormProps } from "./common";

const skillMultiSchema = z.object({
  category: z.string(),
});

export type SkillMultiSchema = z.infer<typeof skillMultiSchema>;

export interface SkillMultiFormProps
  extends CommonFormProps<UpdateSkillInput> {}

export function SkillMultiForm({
  onSubmit,
  onCancel,
  isDisabled,
  isLoading,
}: SkillMultiFormProps) {
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
        label="Change Category"
        onChange={setChangeCategory}
      />

      <Field name="category">
        {(field) => (
          <TextInput
            disabled={!changeCategory}
            error={fieldError(field.state.meta)}
            label="Category"
            name={field.name}
            onChange={field.handleChange}
            placeholder={PLACEHOLDERS.category}
            value={field.state.value ?? ""}
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
              Update Skills
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
