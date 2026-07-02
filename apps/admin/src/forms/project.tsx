import { DeepKeys, DeepValue, useForm } from "@tanstack/react-form";
import { useCallback } from "react";
import { toast } from "react-toastify";
import z from "zod";
import { FieldArray } from "@/components/inputs/field-array";
import { MultiSelectInput } from "@/components/inputs/multi-select";
import { RangeInput } from "@/components/inputs/range";
import { SelectInput } from "@/components/inputs/select";
import { TextInput } from "@/components/inputs/text";
import { TextareaInput } from "@/components/inputs/textarea";
import { LOCALES } from "@/consts/locales";
import { PLACEHOLDERS } from "@/consts/placeholders";
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
import { useFindManyActiveSkills } from "@/hooks/queries/skills";
import { fieldError } from "@/lib/field-error";
import { createEmptyI18n, i18nLabel, i18nLabelsByIds } from "@/lib/i18n";
import { isSlugTaken } from "@/lib/slug";
import { CommonFormProps } from "./common";

const projectSchema = z.object({
  slug: z
    .string()
    .min(1, "required field")
    .regex(SLUG_REGEX, "invalid field format"),
  relevance: z.number().min(1, "must be a positive number"),
  skillIds: z.array(z.string()),
  images: z.array(z.url()),
  urls: z.array(
    z.object({
      title: z.string().min(1, "required field"),
      value: z.url(),
    })
  ),
  i18n: z
    .array(
      z.object({
        locale: z.string().min(1, "required field"),
        title: z.string().min(1, "required field"),
        description: z.string().min(1, "required field"),
      })
    )
    .min(1, "required group")
    .refine(
      (items) => {
        const locales = items.map((item) => item.locale);
        return new Set(locales).size === locales.length;
      },
      { message: "locales must be unique" }
    ),
});

export type ProjectSchema = z.infer<typeof projectSchema>;

export interface ProjectFormProps extends CommonFormProps<ProjectSchema> {
  slugsList?: string[];
}

export function projectToInput(data: ProjectSchema): CreateProjectInput {
  return {
    slug: data.slug,
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
    slug: project.slug,
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
  const findManySkills = useFindManyActiveSkills();
  useQueryAllPages(findManySkills);

  const atsSummarize = useAtsSummarize();
  const translate = useTranslate();

  const skillOptions = (findManySkills.data?.nodes ?? []).map((skill) => ({
    label: i18nLabel(skill),
    value: skill.id,
  }));

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
        return toast.error("Description must be at least 32 characters long");

      const skills = i18nLabelsByIds(
        findManySkills.data?.nodes,
        form.getFieldValue("skillIds")
      );
      if (!skills.length) return toast.error("At least one skill is required");

      const title = fieldGroup.title;
      if (!title) return toast.error("Title is required");
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
        return toast.error("Description must be at least 32 characters long");

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
    [translate.mutateAsync, form.setFieldValue]
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
      <Field name="relevance">
        {(field) => (
          <RangeInput
            className="range-xs"
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
      <Field name="skillIds">
        {(field) => (
          <MultiSelectInput
            error={fieldError(field.state.meta)}
            label="Skills"
            onChange={field.handleChange}
            options={skillOptions}
            placeholder={PLACEHOLDERS.search}
            value={field.state.value}
          />
        )}
      </Field>

      <div className="divider">Images</div>

      <Field mode="array" name="images">
        {(arrayField) => (
          <FieldArray
            error={fieldError(arrayField.state.meta)}
            label="Image"
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
                    placeholder={PLACEHOLDERS.url}
                    value={field.state.value}
                  />
                )}
              </Field>
            )}
          </FieldArray>
        )}
      </Field>

      <div className="divider">Links</div>

      <Field mode="array" name="urls">
        {(arrayField) => (
          <FieldArray
            error={fieldError(arrayField.state.meta)}
            label="Link"
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
                      placeholder={PLACEHOLDERS.linkTitle}
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
                      placeholder={PLACEHOLDERS.url}
                      value={field.state.value}
                    />
                  )}
                </Field>
              </>
            )}
          </FieldArray>
        )}
      </Field>

      <div className="divider">Translations</div>

      <Field mode="array" name="i18n">
        {(arrayField) => (
          <FieldArray
            error={fieldError(arrayField.state.meta)}
            label="Translation"
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
                      label="Locale"
                      name={field.name}
                      onChange={field.handleChange}
                      options={LOCALES}
                      placeholder={PLACEHOLDERS.chooseOne}
                      value={field.state.value}
                    />
                  )}
                </Field>
                <Field name={`i18n[${index}].title`}>
                  {(field) => (
                    <TextInput
                      error={fieldError(field.state.meta)}
                      label="Title"
                      name={field.name}
                      onChange={field.handleChange}
                      placeholder={PLACEHOLDERS.projectTitle}
                      value={field.state.value}
                    />
                  )}
                </Field>
                <Field name={`i18n[${index}].description`}>
                  {(field) => (
                    <TextareaInput
                      disabled={atsSummarize.isPending || translate.isPending}
                      error={fieldError(field.state.meta)}
                      label="Description"
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
                      placeholder={PLACEHOLDERS.description}
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
              {state === "UPDATING" ? "Update Project" : "Create Project"}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
