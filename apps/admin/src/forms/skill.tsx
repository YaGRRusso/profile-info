import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import z from "zod";
import { FieldArray } from "@/components/inputs/field-array";
import { SelectInput } from "@/components/inputs/select";
import { TextInput } from "@/components/inputs/text";
import { LOCALES } from "@/consts/locales";
import { SLUG_REGEX } from "@/consts/regex";
import { type CreateSkillInput } from "@/generated/graphql/graphql";
import type { SkillRow } from "@/hooks/queries/skills";
import { fieldError } from "@/lib/field-error";
import { FormError } from "@/lib/form-errors";
import { hasUniqueLocales } from "@/lib/form-validation";
import { createEmptyI18n } from "@/lib/i18n";
import { isSlugTaken } from "@/lib/slug";
import { CommonFormProps } from "./common";

const skillSchema = z.object({
  slug: z
    .string()
    .min(1, FormError.requiredField)
    .regex(SLUG_REGEX, FormError.invalidField),
  category: z.string(),
  i18n: z
    .array(
      z.object({
        locale: z.string().min(1, FormError.requiredField),
        title: z.string().min(1, FormError.requiredField),
      })
    )
    .min(1, FormError.requiredGroup)
    .refine(hasUniqueLocales, { message: FormError.uniqueField }),
});

export type SkillSchema = z.infer<typeof skillSchema>;

export interface SkillFormProps extends CommonFormProps<SkillSchema> {
  slugsList?: string[];
}

export function skillToInput(data: SkillSchema): CreateSkillInput {
  return {
    slug: data.slug,
    category: data.category || undefined,
    i18n: data.i18n.map((translation) => ({
      locale: translation.locale,
      messages: { title: translation.title },
    })),
  };
}

export function skillToForm(skill: SkillRow): Partial<SkillSchema> {
  return {
    slug: skill.slug,
    category: skill.category ?? "",
    i18n: skill.i18n.map((translation) => ({
      locale: translation.locale,
      title: translation.messages.title,
    })),
  };
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
  const { t: tForm } = useTranslation("forms");
  const { t: tAction } = useTranslation("actions");

  const form = useForm({
    defaultValues: {
      slug: "",
      category: "",
      i18n: createEmptyI18n({ title: "" }),
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
        name="slug"
        validators={{
          onChange: ({ value }) => {
            if (isSlugTaken(value, slugsList, defaultValues?.slug)) {
              return { message: FormError.existingField };
            }
          },
        }}
      >
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label={tForm("fields.slug.label")}
            name={field.name}
            onChange={field.handleChange}
            placeholder={tForm("fields.slug.placeholder")}
            tooltip={tForm("fields.slug.tooltip")}
            value={field.state.value}
          />
        )}
      </Field>

      <Field name="category">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label={tForm("fields.skillCategory.label")}
            name={field.name}
            onChange={field.handleChange}
            placeholder={tForm("fields.skillCategory.placeholder")}
            tooltip={tForm("fields.skillCategory.tooltip")}
            value={field.state.value ?? ""}
          />
        )}
      </Field>

      <div className="divider">{tForm("sections.translations")}</div>

      <Field mode="array" name="i18n">
        {(arrayField) => (
          <FieldArray
            error={fieldError(arrayField.state.meta)}
            label={tForm("fields.translation.label")}
            onAdd={() => arrayField.pushValue({ locale: "", title: "" })}
            onRemove={(index) => arrayField.removeValue(index)}
            values={arrayField.state.value}
          >
            {(index) => (
              <>
                <Field name={`i18n[${index}].locale`}>
                  {(field) => (
                    <SelectInput
                      error={fieldError(field.state.meta)}
                      label={tForm("fields.locale.label")}
                      name={field.name}
                      onChange={field.handleChange}
                      options={LOCALES}
                      placeholder={tForm("fields.locale.placeholder")}
                      tooltip={tForm("fields.locale.tooltip")}
                      value={field.state.value}
                    />
                  )}
                </Field>
                <Field name={`i18n[${index}].title`}>
                  {(field) => (
                    <TextInput
                      error={fieldError(field.state.meta)}
                      label={tForm("fields.skillTitle.label")}
                      name={field.name}
                      onChange={field.handleChange}
                      placeholder={tForm("fields.skillTitle.placeholder")}
                      tooltip={tForm("fields.skillTitle.tooltip")}
                      value={field.state.value}
                    />
                  )}
                </Field>
              </>
            )}
          </FieldArray>
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
              {state === "UPDATING"
                ? tForm("submit.updateSkill")
                : tForm("submit.createSkill")}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
