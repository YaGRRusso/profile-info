import { DeepKeys, DeepValue, useForm } from "@tanstack/react-form";
import { useCallback } from "react";
import { toast } from "react-toastify";
import z from "zod";
import { FieldArray } from "@/components/inputs/field-array";
import { MultiSelectInput } from "@/components/inputs/multi-select";
import { NumberInput } from "@/components/inputs/number";
import { RangeInput } from "@/components/inputs/range";
import { SelectInput } from "@/components/inputs/select";
import { TextInput } from "@/components/inputs/text";
import { TextareaInput } from "@/components/inputs/textarea";
import { LOCALES } from "@/consts/locales";
import { PLACEHOLDERS } from "@/consts/placeholders";
import { RawSizeEnum } from "@/consts/raw-size";
import { SLUG_REGEX } from "@/consts/regex";
import {
  CourseStatus,
  type CreateCourseInput,
  DetailInput,
  ResourceType,
} from "@/generated/graphql/graphql";
import { useQueryAllPages } from "@/hooks/custom/use-query-all-pages";
import { useAtsSummarize, useTranslate } from "@/hooks/mutations/ai";
import type { CourseRow } from "@/hooks/queries/courses";
import { useFindManyActiveOrganizations } from "@/hooks/queries/organizations";
import { useFindManyActiveSkills } from "@/hooks/queries/skills";
import { fieldError } from "@/lib/field-error";
import { createEmptyI18n, pickTranslation } from "@/lib/i18n";
import { findLabelsByIds } from "@/lib/mappers";
import { isSlugTaken } from "@/lib/slug";
import { CommonFormProps } from "./common";

const courseSchema = z.object({
  slug: z
    .string()
    .min(1, "required field")
    .regex(SLUG_REGEX, "invalid field format"),
  organizationId: z.string().min(1, "required field"),
  status: z.enum(CourseStatus, "required field"),
  relevance: z.number().min(1, "must be a positive number"),
  url: z.url().or(z.literal("")),
  image: z.url().or(z.literal("")),
  hours: z.number(),
  skillIds: z.array(z.string()),
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

export type CourseSchema = z.infer<typeof courseSchema>;

export interface CourseFormProps extends CommonFormProps<CourseSchema> {
  slugsList?: string[];
}

export function courseToInput(data: CourseSchema): CreateCourseInput {
  return {
    slug: data.slug,
    organizationId: data.organizationId,
    status: data.status,
    relevance: data.relevance,
    url: data.url || undefined,
    image: data.image || undefined,
    hours: data.hours || undefined,
    skillIds: data.skillIds.length ? data.skillIds : undefined,
    i18n: data.i18n.map((translation) => ({
      locale: translation.locale,
      messages: {
        title: translation.title,
        description: translation.description,
      },
    })),
  };
}

export function courseToForm(course: CourseRow): Partial<CourseSchema> {
  return {
    slug: course.slug,
    organizationId: course.organization?.id ?? "",
    status: course.status,
    relevance: course.relevance,
    url: course.url ?? "",
    image: course.image ?? "",
    hours: course.hours ?? 0,
    skillIds: (course.skills ?? []).map((skill) => skill.id),
    i18n: course.i18n.map((translation) => ({
      locale: translation.locale,
      title: translation.messages.title,
      description: translation.messages.description,
    })),
  };
}

const STATUS_OPTIONS = Object.values(CourseStatus).map((status) => ({
  label: status,
  value: status,
}));

export function CourseForm({
  onSubmit,
  onCancel,
  defaultValues,
  isDisabled,
  slugsList,
  isLoading,
  state,
}: CourseFormProps) {
  const findManyOrganizations = useFindManyActiveOrganizations();
  useQueryAllPages(findManyOrganizations);

  const findManySkills = useFindManyActiveSkills();
  useQueryAllPages(findManySkills);

  const atsSummarize = useAtsSummarize();
  const translate = useTranslate();

  const organizationOptions = (findManyOrganizations.data?.nodes ?? []).map(
    (organization) => ({ label: organization.name, value: organization.id })
  );

  const skillOptions = (findManySkills.data?.nodes ?? []).map((skill) => ({
    label: skill.name,
    value: skill.id,
  }));

  const form = useForm({
    defaultValues: {
      slug: "",
      organizationId: "",
      status: CourseStatus.Complete,
      relevance: 1,
      url: "",
      image: "",
      hours: 0,
      skillIds: [] as string[],
      i18n: createEmptyI18n({ title: "", description: "" }),
      ...defaultValues,
    },
    onSubmit: ({ value }) => onSubmit?.(value),
    validators: { onChange: courseSchema },
  });

  const handleAtsOptimize = useCallback(
    async <Field extends DeepKeys<CourseSchema>>(
      fieldGroup: CourseSchema["i18n"][number],
      fieldName: Field,
      fieldValue: DeepValue<CourseSchema, Field>
    ) => {
      const details: DetailInput[] = [];

      const raw = fieldValue as string;
      const type = ResourceType.Course;

      if (raw.trim().length <= RawSizeEnum.XSMALL)
        return toast.error("Description must be at least 64 characters long");

      const skills = findLabelsByIds({
        items: findManySkills.data?.nodes,
        lookupKey: "id",
        labelKey: "name",
        targetValues: form.getFieldValue("skillIds"),
      });
      if (!skills.length) return toast.error("At least one skill is required");

      const title = fieldGroup.title;
      if (!title) return toast.error("Title is required");
      details.push({ key: "Title", value: [title] });

      const duration = form.getFieldValue("hours");
      if (!duration) return toast.error("Hours is required");
      details.push({ key: "Hours", value: [`${duration} hours`] });

      const status = form.getFieldValue("status");
      if (!status) return toast.error("Status is required");
      details.push({ key: "Status", value: [status] });

      const organization = findManyOrganizations.data?.nodes.find(
        (org) => org.id === form.getFieldValue("organizationId")
      );
      if (!organization) return toast.error("Organization is required");

      const organizationName = organization.name;
      details.push({ key: "Organization Name", value: [organizationName] });

      const organizationDescription = pickTranslation(
        organization.i18n,
        fieldGroup.locale
      )?.messages.description;
      if (organizationDescription)
        details.push({
          key: "Organization Description",
          value: [organizationDescription],
        });

      const language = fieldGroup.locale;
      if (language) details.push({ key: "Language", value: [language] });

      const url = form.getFieldValue("url");
      if (url) details.push({ key: "URLs", value: [url] });

      const summarized = await atsSummarize.mutateAsync({
        raw,
        type,
        skills,
        details,
      });

      form.setFieldValue(
        fieldName,
        summarized.atsSummarize.messages[0].message.content as DeepValue<
          CourseSchema,
          Field
        >
      );
    },
    [
      atsSummarize.mutateAsync,
      form.getFieldValue,
      form.setFieldValue,
      findManyOrganizations.data?.nodes,
      findManySkills.data?.nodes,
    ]
  );

  const handleTranslate = useCallback(
    async <Field extends DeepKeys<CourseSchema>>(
      fieldGroup: CourseSchema["i18n"][number],
      fieldName: Field,
      fieldValue: DeepValue<CourseSchema, Field>
    ) => {
      const raw = fieldValue as string;

      if (raw.trim().length <= RawSizeEnum.XSMALL)
        return toast.error("Description must be at least 64 characters long");

      const translated = await translate.mutateAsync({
        raw,
        targetLanguage: fieldGroup.locale,
      });

      form.setFieldValue(
        fieldName,
        translated.translate.messages[0].message.content as DeepValue<
          CourseSchema,
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
      <Field name="organizationId">
        {(field) => (
          <SelectInput
            disabled={!organizationOptions.length}
            error={fieldError(field.state.meta)}
            label="Organization"
            name={field.name}
            onChange={field.handleChange}
            options={organizationOptions}
            placeholder={PLACEHOLDERS.chooseOne}
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="status">
        {(field) => (
          <SelectInput
            error={fieldError(field.state.meta)}
            label="Status"
            name={field.name}
            onChange={(value) => field.handleChange(value as CourseStatus)}
            options={STATUS_OPTIONS}
            placeholder={PLACEHOLDERS.chooseOne}
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="url">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label="URL"
            name={field.name}
            onChange={field.handleChange}
            placeholder={PLACEHOLDERS.url}
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="image">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label="Image"
            name={field.name}
            onChange={field.handleChange}
            placeholder={PLACEHOLDERS.url}
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="hours">
        {(field) => (
          <NumberInput
            error={fieldError(field.state.meta)}
            label="Hours"
            min={0}
            name={field.name}
            onChange={field.handleChange}
            placeholder={PLACEHOLDERS.hours}
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
                      placeholder={PLACEHOLDERS.courseTitle}
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
              {state === "UPDATING" ? "Update Course" : "Create Course"}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
