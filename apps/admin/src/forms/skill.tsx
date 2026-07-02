import { useForm } from "@tanstack/react-form";
import lodash from "lodash";
import { useState } from "react";
import z from "zod";
import { TextInput } from "@/components/inputs/text";
import { PLACEHOLDERS } from "@/consts/placeholders";
import { SLUG_REGEX } from "@/consts/regex";
import { fieldError } from "@/lib/field-error";
import { isSlugTaken } from "@/lib/slug";
import { CommonFormProps } from "./common";

const skillSchema = z.object({
  slug: z
    .string()
    .min(1, "required field")
    .regex(SLUG_REGEX, "invalid field format"),
  name: z.string().min(1, "required field"),
  category: z.string(),
});

export type SkillSchema = z.infer<typeof skillSchema>;

export interface SkillFormProps extends CommonFormProps<SkillSchema> {
  slugsList?: string[];
}

export function SkillForm({
  onSubmit,
  onCancel,
  defaultValues,
  isDisabled,
  slugsList,
  isLoading,
  state,
}: SkillFormProps) {
  const [isNameEdited, setIsNameEdited] = useState(!!defaultValues?.name);

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      category: "",
      ...defaultValues,
    },
    onSubmit: ({ value }) => onSubmit?.(value),
    validators: { onChange: skillSchema },
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
      <Field
        listeners={{
          onChange: ({ value }) => {
            if (!isNameEdited) {
              form.setFieldValue("name", lodash.startCase(value));
            }
          },
        }}
        name="slug"
        validators={{
          onChange: ({ value }) => {
            if (isSlugTaken(value, slugsList, defaultValues?.slug)) {
              return { message: "slug already exists" };
            }
          },
        }}
      >
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label="Slug"
            name={field.name}
            onChange={field.handleChange}
            placeholder={PLACEHOLDERS.slug}
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="name">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label="Name"
            name={field.name}
            onChange={(value) => {
              setIsNameEdited(true);
              field.handleChange(value);
            }}
            placeholder={PLACEHOLDERS.skillName}
            value={field.state.value}
          />
        )}
      </Field>

      <Field name="category">
        {(field) => (
          <TextInput
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
          {({ canSubmit, isSubmitting, isTouched }) => (
            <button
              className="btn btn-soft btn-primary flex-1"
              disabled={
                !canSubmit ||
                !isTouched ||
                isSubmitting ||
                isDisabled ||
                isLoading
              }
              type="submit"
            >
              {(isSubmitting || isLoading) && (
                <span className="loading loading-spinner loading-xs" />
              )}
              {state === "UPDATING" ? "Update Skill" : "Create Skill"}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
