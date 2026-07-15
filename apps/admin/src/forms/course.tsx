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
  ContextMode,
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
import { hasLength } from "@/lib/has-length";
import {
  createEmptyI18n,
  i18nLabel,
  i18nLabelsByIds,
  pickTranslation,
} from "@/lib/i18n";
import { isSlugTaken } from "@/lib/slug";
import { CommonFormProps } from "./common";

const courseSchema = z.object({
  hours: z.number(),
  i18n: z
    .array(
      z.object({
        description: z.string().min(1, FormError.requiredField),
        locale: z.string().min(1, FormError.requiredField),
        title: z.string().min(1, FormError.requiredField),
      })
    )
    .min(1, FormError.requiredGroup)
    .refine(hasUniqueLocales, { message: FormError.uniqueField }),
  image: z.url(FormError.invalidFormat).or(z.literal("")),
  organizationId: z.string().min(1, FormError.requiredField),
  relevance: z.number().min(1, FormError.minValue),
  skillIds: z.array(z.string()),
  slug: z.string().regex(SLUG_REGEX, FormError.invalidFormat).or(z.literal("")),
  status: z.enum(CourseStatus, FormError.requiredField),
  url: z.url(FormError.invalidFormat).or(z.literal("")),
});

export type CourseSchema = z.infer<typeof courseSchema>;

export interface CourseFormProps extends CommonFormProps<CourseSchema> {
  slugsList?: string[];
}

export function courseToInput(data: CourseSchema): CreateCourseInput {
  return {
    hours: nullIfEmpty(data.hours),
    i18n: data.i18n.map((translation) => ({
      locale: translation.locale,
      messages: {
        description: translation.description,
        title: translation.title,
      },
    })),
    image: nullIfEmpty(data.image),
    organizationId: data.organizationId,
    relevance: data.relevance,
    skillIds: nullIfEmpty(data.skillIds),
    slug: nullIfEmpty(data.slug),
    status: data.status,
    url: nullIfEmpty(data.url),
  };
}

export function courseToForm(course: CourseRow): Partial<CourseSchema> {
  return {
    hours: course.hours ?? 0,
    i18n: course.i18n.map((translation) => ({
      description: translation.messages.description,
      locale: translation.locale,
      title: translation.messages.title,
    })),
    image: course.image ?? "",
    organizationId: course.organization?.id ?? "",
    relevance: course.relevance,
    skillIds: (course.skills ?? []).map((skill) => skill.id),
    slug: course.slug ?? "",
    status: course.status,
    url: course.url ?? "",
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
  isLoading,
  slugsList,
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
        disabled: skill.disabled,
        label: i18nLabel(skill, locale),
        value: skill.id,
      })),
    [locale, findManySkills.data?.nodes]
  );

  const organizationOptions = useMemo(
    () =>
      (findManyOrganizations.data?.nodes ?? []).map((organization) => ({
        disabled: organization.disabled,
        label: organization.name,
        value: organization.id,
      })),
    [findManyOrganizations.data?.nodes]
  );

  const atsSummarize = useAtsSummarize();
  const translate = useTranslate();

  const form = useForm({
    defaultValues: {
      hours: 0,
      i18n: createEmptyI18n({ description: "", title: "" }),
      image: "",
      organizationId: "",
      relevance: 1,
      skillIds: Array.of<string>(),
      slug: "",
      status: CourseStatus.Complete,
      url: "",
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

      if (!hasLength(raw, { min: RawSizeEnum.XSMALL }))
        return toast.error(
          tValidation("minLength", { value: RawSizeEnum.XSMALL })
        );

      const skills = i18nLabelsByIds(
        findManySkills.data?.nodes,
        form.getFieldValue("skillIds")
      );

      const { title } = fieldGroup;
      if (title) details.push({ key: "Title", value: [title] });

      const duration = form.getFieldValue("hours");
      if (duration)
        details.push({ key: "Hours", value: [`${duration} hours`] });

      const status = form.getFieldValue("status");
      if (status) details.push({ key: "Status", value: [status] });

      const organization = findManyOrganizations.data?.nodes.find(
        (org) => org.id === form.getFieldValue("organizationId")
      );

      if (organization) {
        details.push({ key: "Organization Name", value: [organization.name] });

        const organizationDescription = pickTranslation(
          organization.i18n,
          fieldGroup.locale
        )?.messages.description;
        if (organizationDescription)
          details.push({
            key: "Organization Description",
            value: [organizationDescription],
          });
      }

      const language = fieldGroup.locale;
      if (language) details.push({ key: "Language", value: [language] });

      const url = form.getFieldValue("url");
      if (url)
        details.push({
          contextMode: ContextMode.PageExtract,
          key: "URLs",
          value: [url],
        });

      const summarized = await atsSummarize.mutateAsync({
        details,
        raw,
        skills,
        type,
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

      if (!hasLength(raw, { min: RawSizeEnum.XSMALL }))
        return toast.error(
          tValidation("minLength", { value: RawSizeEnum.XSMALL })
        );

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
            optional
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
            onChange={field.handleChange}
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
            ai
            error={fieldError(field.state.meta)}
            label={tForm("fields.url.label")}
            name={field.name}
            onChange={field.handleChange}
            optional
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
            optional
            placeholder={tForm("fields.image.placeholder")}
            tooltip={tForm("fields.image.tooltip")}
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
            optional
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
            optional
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
              arrayField.pushValue({ description: "", locale: "", title: "" })
            }
            onRemove={(index) => arrayField.removeValue(index)}
            tooltip={tForm("fields.translation.tooltip")}
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
