import { DeepKeys, DeepValue, useForm } from "@tanstack/react-form";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import z from "zod";
import { FormDivider } from "@/components/inputs/divider";
import { FieldArray } from "@/components/inputs/field-array";
import { MultiSelectInput } from "@/components/inputs/multi-select";
import { RangeInput } from "@/components/inputs/range";
import { SelectInput } from "@/components/inputs/select";
import { TextInput } from "@/components/inputs/text";
import { TextareaInput } from "@/components/inputs/textarea";
import { LOCALES } from "@/consts/locales";
import { RawSizeEnum } from "@/consts/raw-size";
import { SLUG_REGEX } from "@/consts/regex";
import {
  type CreateProjectInput,
  DetailInput,
  ResourceType,
} from "@/generated/graphql/graphql";
import { useQueryAllPages } from "@/hooks/custom/use-query-all-pages";
import { useAtsSummarize, useTranslate } from "@/hooks/mutations/ai";
import type { ProjectRow } from "@/hooks/queries/projects";
import { useFindManySkills } from "@/hooks/queries/skills";
import { fieldError } from "@/lib/field-error";
import { FormError } from "@/lib/form-errors";
import { hasUniqueLocales } from "@/lib/form-validation";
import { createEmptyI18n, i18nLabel, i18nLabelsByIds } from "@/lib/i18n";
import { isSlugTaken } from "@/lib/slug";
import { CommonFormProps } from "./common";

const projectSchema = z.object({
  slug: z.string().regex(SLUG_REGEX, FormError.invalidFormat).or(z.literal("")),
  relevance: z.number().min(1, FormError.minValue),
  skillIds: z.array(z.string()),
  images: z.array(z.url(FormError.invalidFormat)),
  urls: z.array(
    z.object({
      title: z.string().min(1, FormError.requiredField),
      value: z.url(FormError.invalidFormat),
    })
  ),
  i18n: z
    .array(
      z.object({
        locale: z.string().min(1, FormError.requiredField),
        title: z.string().min(1, FormError.requiredField),
        description: z.string().min(1, FormError.requiredField),
      })
    )
    .min(1, FormError.requiredGroup)
    .refine(hasUniqueLocales, { message: FormError.uniqueField }),
});

export type ProjectSchema = z.infer<typeof projectSchema>;

export interface ProjectFormProps extends CommonFormProps<ProjectSchema> {
  slugsList?: string[];
}

export function projectToInput(data: ProjectSchema): CreateProjectInput {
  return {
    slug: data.slug || undefined,
    relevance: data.relevance,
    skillIds: data.skillIds.length ? data.skillIds : undefined,
    images: data.images.length ? data.images : undefined,
    urls: data.urls.length ? data.urls : undefined,
    i18n: data.i18n.map((translation) => ({
      locale: translation.locale,
      messages: {
        title: translation.title,
        description: translation.description,
      },
    })),
  };
}

export function projectToForm(project: ProjectRow): Partial<ProjectSchema> {
  return {
    slug: project.slug ?? "",
    relevance: project.relevance,
    skillIds: (project.skills ?? []).map((skill) => skill.id),
    images: project.images ?? [],
    urls: (project.urls ?? []).map((url) => ({
      title: url.title,
      value: url.value,
    })),
    i18n: project.i18n.map((translation) => ({
      locale: translation.locale,
      title: translation.messages.title,
      description: translation.messages.description,
    })),
  };
}

export function ProjectForm({
  onSubmit,
  onCancel,
  defaultValues,
  isDisabled,
  slugsList,
  isLoading,
  state,
}: ProjectFormProps) {
  const { t: tForm } = useTranslation("forms");
  const { t: tValidation } = useTranslation("validation");
  const { t: tAction } = useTranslation("actions");
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const findManySkills = useFindManySkills();
  useQueryAllPages(findManySkills);

  const skillOptions = useMemo(
    () =>
      (findManySkills.data?.nodes ?? []).map((skill) => ({
        label: i18nLabel(skill, locale),
        value: skill.id,
        disabled: skill.disabled,
      })),
    [locale, findManySkills.data?.nodes]
  );

  const atsSummarize = useAtsSummarize();
  const translate = useTranslate();

  const form = useForm({
    defaultValues: {
      slug: "",
      relevance: 1,
      skillIds: [] as string[],
      images: [] as string[],
      urls: [] as { title: string; value: string }[],
      i18n: createEmptyI18n({ title: "", description: "" }),
      ...defaultValues,
    },
    onSubmit: ({ value }) => onSubmit?.(value),
    validators: { onChange: projectSchema },
  });

  const handleAtsOptimize = useCallback(
    async <Field extends DeepKeys<ProjectSchema>>(
      fieldGroup: ProjectSchema["i18n"][number],
      fieldName: Field,
      fieldValue: DeepValue<ProjectSchema, Field>
    ) => {
      const details: DetailInput[] = [];

      const raw = fieldValue as string;
      const type = ResourceType.Project;

      if (raw.trim().length <= RawSizeEnum.XSMALL)
        return toast.error(tValidation("minLength", { value: 32 }));

      const skills = i18nLabelsByIds(
        findManySkills.data?.nodes,
        form.getFieldValue("skillIds")
      );
      if (!skills.length)
        return toast.error(tValidation("minCount", { value: 1 }));

      const title = fieldGroup.title;
      if (!title) return toast.error(tValidation("requiredField"));
      details.push({ key: "Title", value: [title] });

      const language = fieldGroup.locale;
      if (language) details.push({ key: "Language", value: [language] });

      const urls = form.getFieldValue("urls")?.map((url) => url.value) ?? [];
      if (urls) details.push({ key: "URLs", value: urls });

      const summarized = await atsSummarize.mutateAsync({
        raw,
        type,
        skills,
        details,
      });

      form.setFieldValue(
        fieldName,
        summarized.atsSummarize.messages[0].message.content as DeepValue<
          ProjectSchema,
          Field
        >
      );
    },
    [
      atsSummarize.mutateAsync,
      form.getFieldValue,
      form.setFieldValue,
      findManySkills.data?.nodes,
      tValidation,
    ]
  );

  const handleTranslate = useCallback(
    async <Field extends DeepKeys<ProjectSchema>>(
      fieldGroup: ProjectSchema["i18n"][number],
      fieldName: Field,
      fieldValue: DeepValue<ProjectSchema, Field>
    ) => {
      const raw = fieldValue as string;

      if (raw.trim().length <= RawSizeEnum.XSMALL)
        return toast.error(tValidation("minLength", { value: 32 }));

      const translated = await translate.mutateAsync({
        raw,
        targetLanguage: fieldGroup.locale,
      });

      form.setFieldValue(
        fieldName,
        translated.translate.messages[0].message.content as DeepValue<
          ProjectSchema,
          Field
        >
      );
    },
    [translate.mutateAsync, form.setFieldValue, tValidation]
  );

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
      <Field name="relevance">
        {(field) => (
          <RangeInput
            className="range-xs"
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
      <Field name="skillIds">
        {(field) => (
          <MultiSelectInput
            error={fieldError(field.state.meta)}
            label={tForm("fields.skills.label")}
            onChange={field.handleChange}
            options={skillOptions}
            placeholder={tForm("fields.skills.placeholder")}
            tooltip={tForm("fields.skills.tooltip")}
            value={field.state.value}
          />
        )}
      </Field>

      <FormDivider
        label={tForm("sections.images.label")}
        tooltip={tForm("sections.images.tooltip")}
      />

      <Field mode="array" name="images">
        {(arrayField) => (
          <FieldArray
            error={fieldError(arrayField.state.meta)}
            label={tForm("fields.image.label")}
            onAdd={() => arrayField.pushValue("")}
            onRemove={(index) => arrayField.removeValue(index)}
            values={arrayField.state.value}
          >
            {(index) => (
              <Field name={`images[${index}]`}>
                {(field) => (
                  <TextInput
                    error={fieldError(field.state.meta)}
                    name={field.name}
                    onChange={field.handleChange}
                    placeholder={tForm("fields.image.placeholder")}
                    value={field.state.value}
                  />
                )}
              </Field>
            )}
          </FieldArray>
        )}
      </Field>

      <FormDivider
        label={tForm("sections.links.label")}
        tooltip={tForm("sections.links.tooltip")}
      />

      <Field mode="array" name="urls">
        {(arrayField) => (
          <FieldArray
            error={fieldError(arrayField.state.meta)}
            label={tForm("fields.link.label")}
            onAdd={() => arrayField.pushValue({ title: "", value: "" })}
            onRemove={(index) => arrayField.removeValue(index)}
            values={arrayField.state.value}
          >
            {(index) => (
              <>
                <Field name={`urls[${index}].title`}>
                  {(field) => (
                    <TextInput
                      error={fieldError(field.state.meta)}
                      name={field.name}
                      onChange={field.handleChange}
                      placeholder={tForm("fields.linkTitle.placeholder")}
                      value={field.state.value}
                    />
                  )}
                </Field>
                <Field name={`urls[${index}].value`}>
                  {(field) => (
                    <TextInput
                      error={fieldError(field.state.meta)}
                      name={field.name}
                      onChange={field.handleChange}
                      placeholder={tForm("fields.linkUrl.placeholder")}
                      value={field.state.value}
                    />
                  )}
                </Field>
              </>
            )}
          </FieldArray>
        )}
      </Field>

      <FormDivider
        label={tForm("sections.translations.label")}
        tooltip={tForm("sections.translations.tooltip")}
      />

      <Field mode="array" name="i18n">
        {(arrayField) => (
          <FieldArray
            error={fieldError(arrayField.state.meta)}
            label={tForm("fields.translation.label")}
            onAdd={() =>
              arrayField.pushValue({ locale: "", title: "", description: "" })
            }
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
                      label={tForm("fields.projectTitle.label")}
                      name={field.name}
                      onChange={field.handleChange}
                      placeholder={tForm("fields.projectTitle.placeholder")}
                      tooltip={tForm("fields.projectTitle.tooltip")}
                      value={field.state.value}
                    />
                  )}
                </Field>
                <Field name={`i18n[${index}].description`}>
                  {(field) => (
                    <TextareaInput
                      disabled={atsSummarize.isPending || translate.isPending}
                      error={fieldError(field.state.meta)}
                      label={tForm("fields.description.label")}
                      name={field.name}
                      onChange={field.handleChange}
                      onOptimize={() =>
                        handleAtsOptimize(
                          arrayField.state.value[index],
                          field.name,
                          field.state.value
                        )
                      }
                      onTranslate={() =>
                        handleTranslate(
                          arrayField.state.value[index],
                          field.name,
                          field.state.value
                        )
                      }
                      placeholder={tForm("fields.description.placeholder")}
                      tooltip={tForm("fields.description.tooltip")}
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
        <Subscribe
          selector={(formState) => ({
            canSubmit: formState.canSubmit,
            isSubmitting: formState.isSubmitting,
            isTouched: formState.isTouched,
          })}
        >
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
                ? tForm("submit.updateProject")
                : tForm("submit.createProject")}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
