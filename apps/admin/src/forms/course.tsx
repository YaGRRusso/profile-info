import { DeepKeys, DeepValue, useForm } from "@tanstack/react-form";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import z from "zod";
import { FormDivider } from "@/components/inputs/divider";
import { FieldArray } from "@/components/inputs/field-array";
import { MultiSelectInput } from "@/components/inputs/multi-select";
import { NumberInput } from "@/components/inputs/number";
import { RangeInput } from "@/components/inputs/range";
import { SelectInput } from "@/components/inputs/select";
import { TextInput } from "@/components/inputs/text";
import { TextareaInput } from "@/components/inputs/textarea";
import { LOCALES } from "@/consts/locales";
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
import { useFindManyOrganizations } from "@/hooks/queries/organizations";
import { useFindManySkills } from "@/hooks/queries/skills";
import { fieldError } from "@/lib/field-error";
import { FormError } from "@/lib/form-errors";
import { nullIfEmpty } from "@/lib/form-input";
import { hasUniqueLocales } from "@/lib/form-validation";
import {
  createEmptyI18n,
  i18nLabel,
  i18nLabelsByIds,
  pickTranslation,
} from "@/lib/i18n";
import { isSlugTaken } from "@/lib/slug";
import { CommonFormProps } from "./common";

const courseSchema = z.object({
  slug: z.string().regex(SLUG_REGEX, FormError.invalidFormat).or(z.literal("")),
  organizationId: z.string().min(1, FormError.requiredField),
  status: z.enum(CourseStatus, FormError.requiredField),
  relevance: z.number().min(1, FormError.minValue),
  url: z.url(FormError.invalidFormat).or(z.literal("")),
  image: z.url(FormError.invalidFormat).or(z.literal("")),
  hours: z.number(),
  skillIds: z.array(z.string()),
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

export type CourseSchema = z.infer<typeof courseSchema>;

export interface CourseFormProps extends CommonFormProps<CourseSchema> {
  slugsList?: string[];
}

export function courseToInput(data: CourseSchema): CreateCourseInput {
  return {
    slug: nullIfEmpty(data.slug),
    organizationId: data.organizationId,
    status: data.status,
    relevance: data.relevance,
    url: nullIfEmpty(data.url),
    image: nullIfEmpty(data.image),
    hours: nullIfEmpty(data.hours),
    skillIds: nullIfEmpty(data.skillIds),
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
    slug: course.slug ?? "",
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
  const { t: tForm } = useTranslation("forms");
  const { t: tValidation } = useTranslation("validation");
  const { t: tAction } = useTranslation("actions");
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const findManyOrganizations = useFindManyOrganizations();
  useQueryAllPages(findManyOrganizations);

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

  const organizationOptions = useMemo(
    () =>
      (findManyOrganizations.data?.nodes ?? []).map((organization) => ({
        label: organization.name,
        value: organization.id,
        disabled: organization.disabled,
      })),
    [findManyOrganizations.data?.nodes]
  );

  const atsSummarize = useAtsSummarize();
  const translate = useTranslate();

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
        return toast.error(tValidation("minLength", { value: 64 }));

      const skills = i18nLabelsByIds(
        findManySkills.data?.nodes,
        form.getFieldValue("skillIds")
      );
      if (!skills.length)
        return toast.error(tValidation("minCount", { value: 1 }));

      const title = fieldGroup.title;
      if (!title) return toast.error(tValidation("requiredField"));
      details.push({ key: "Title", value: [title] });

      const duration = form.getFieldValue("hours");
      if (!duration) return toast.error(tValidation("requiredField"));
      details.push({ key: "Hours", value: [`${duration} hours`] });

      const status = form.getFieldValue("status");
      if (!status) return toast.error(tValidation("requiredField"));
      details.push({ key: "Status", value: [status] });

      const organization = findManyOrganizations.data?.nodes.find(
        (org) => org.id === form.getFieldValue("organizationId")
      );
      if (!organization) return toast.error(tValidation("requiredField"));

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
      tValidation,
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
        return toast.error(tValidation("minLength", { value: 64 }));

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
      <Field name="organizationId">
        {(field) => (
          <SelectInput
            disabled={!organizationOptions.length}
            error={fieldError(field.state.meta)}
            label={tForm("fields.organization.label")}
            name={field.name}
            onChange={field.handleChange}
            options={organizationOptions}
            placeholder={tForm("fields.organization.placeholder")}
            tooltip={tForm("fields.organization.tooltip")}
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="status">
        {(field) => (
          <SelectInput
            error={fieldError(field.state.meta)}
            label={tForm("fields.status.label")}
            name={field.name}
            onChange={(value) => field.handleChange(value as CourseStatus)}
            options={STATUS_OPTIONS}
            placeholder={tForm("fields.status.placeholder")}
            tooltip={tForm("fields.status.tooltip")}
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="url">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label={tForm("fields.url.label")}
            name={field.name}
            onChange={field.handleChange}
            placeholder={tForm("fields.url.placeholder")}
            tooltip={tForm("fields.url.tooltip")}
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="image">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label={tForm("fields.image.label")}
            name={field.name}
            onChange={field.handleChange}
            placeholder={tForm("fields.image.placeholder")}
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="hours">
        {(field) => (
          <NumberInput
            error={fieldError(field.state.meta)}
            label={tForm("fields.hours.label")}
            min={0}
            name={field.name}
            onChange={field.handleChange}
            placeholder={tForm("fields.hours.placeholder")}
            tooltip={tForm("fields.hours.tooltip")}
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
                      label={tForm("fields.courseTitle.label")}
                      name={field.name}
                      onChange={field.handleChange}
                      placeholder={tForm("fields.courseTitle.placeholder")}
                      tooltip={tForm("fields.courseTitle.tooltip")}
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
                ? tForm("submit.updateCourse")
                : tForm("submit.createCourse")}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
