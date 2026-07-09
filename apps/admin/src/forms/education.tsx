import { DeepKeys, DeepValue, useForm } from "@tanstack/react-form";
import { useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import z from "zod";
import { DateRangeInput } from "@/components/inputs/date-range";
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
  type CreateEducationInput,
  DetailInput,
  EducationLevel,
  EducationStatus,
  ResourceType,
} from "@/generated/graphql/graphql";
import { useQueryAllPages } from "@/hooks/custom/use-query-all-pages";
import { useAtsSummarize, useTranslate } from "@/hooks/mutations/ai";
import type { EducationRow } from "@/hooks/queries/educations";
import { useFindManyOrganizations } from "@/hooks/queries/organizations";
import { useFindManySkills } from "@/hooks/queries/skills";
import { toDateInput, toIsoDate } from "@/lib/date";
import { fieldError } from "@/lib/field-error";
import {
  createEmptyI18n,
  i18nLabel,
  i18nLabelsByIds,
  pickTranslation,
} from "@/lib/i18n";
import { isSlugTaken } from "@/lib/slug";
import { useLocaleStore } from "@/stores/locale";
import { CommonFormProps } from "./common";

const educationSchema = z.object({
  slug: z
    .string()
    .min(1, "required field")
    .regex(SLUG_REGEX, "invalid field format"),
  organizationId: z.string().min(1, "required field"),
  level: z.enum(EducationLevel, "required field"),
  status: z.enum(EducationStatus, "required field"),
  relevance: z.number().min(1, "must be a positive number"),
  url: z.url().or(z.literal("")),
  image: z.url().or(z.literal("")),
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
  period: z
    .object({ from: z.string(), to: z.string() })
    .refine((range) => !(range.from && range.to) || range.from <= range.to, {
      message: "end date must be after start date",
    }),
});

export type EducationSchema = z.infer<typeof educationSchema>;

export interface EducationFormProps extends CommonFormProps<EducationSchema> {
  slugsList?: string[];
}

export function educationToInput(data: EducationSchema): CreateEducationInput {
  const period =
    data.period.from || data.period.to
      ? { from: toIsoDate(data.period.from), to: toIsoDate(data.period.to) }
      : undefined;

  return {
    slug: data.slug,
    organizationId: data.organizationId,
    level: data.level,
    status: data.status,
    relevance: data.relevance,
    url: data.url || undefined,
    image: data.image || undefined,
    skillIds: data.skillIds.length ? data.skillIds : undefined,
    period,
    i18n: data.i18n.map((translation) => ({
      locale: translation.locale,
      messages: {
        title: translation.title,
        description: translation.description,
      },
    })),
  };
}

export function educationToForm(
  education: EducationRow
): Partial<EducationSchema> {
  return {
    slug: education.slug,
    organizationId: education.organization?.id ?? "",
    level: education.level,
    status: education.status,
    relevance: education.relevance,
    url: education.url ?? "",
    image: education.image ?? "",
    skillIds: (education.skills ?? []).map((skill) => skill.id),
    period: {
      from: toDateInput(education.period?.from),
      to: toDateInput(education.period?.to),
    },
    i18n: education.i18n.map((translation) => ({
      locale: translation.locale,
      title: translation.messages.title,
      description: translation.messages.description,
    })),
  };
}

const LEVEL_OPTIONS = Object.values(EducationLevel).map((level) => ({
  label: level,
  value: level,
}));

const STATUS_OPTIONS = Object.values(EducationStatus).map((status) => ({
  label: status,
  value: status,
}));

export function EducationForm({
  onSubmit,
  onCancel,
  defaultValues,
  isDisabled,
  slugsList,
  isLoading,
  state,
}: EducationFormProps) {
  const findManyOrganizations = useFindManyOrganizations();
  useQueryAllPages(findManyOrganizations);

  const findManySkills = useFindManySkills();
  useQueryAllPages(findManySkills);

  const locale = useLocaleStore((state) => state.locale);

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
      level: EducationLevel.Bachelor,
      status: EducationStatus.Complete,
      relevance: 1,
      url: "",
      image: "",
      skillIds: [] as string[],
      period: { from: "", to: "" },
      i18n: createEmptyI18n({ title: "", description: "" }),
      ...defaultValues,
    },
    onSubmit: ({ value }) => onSubmit?.(value),
    validators: { onChange: educationSchema },
  });

  const handleAtsOptimize = useCallback(
    async <Field extends DeepKeys<EducationSchema>>(
      fieldGroup: EducationSchema["i18n"][number],
      fieldName: Field,
      fieldValue: DeepValue<EducationSchema, Field>
    ) => {
      const details: DetailInput[] = [];

      const raw = fieldValue as string;
      const type = ResourceType.Education;

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

      const period = form.getFieldValue("period");
      if (!period.from && !period.to) return toast.error("Period is required");
      details.push({
        key: "Period",
        value: [`from ${period.from} to ${period.to}`],
      });

      const level = form.getFieldValue("level");
      if (!level) return toast.error("Level is required");
      details.push({ key: "Level", value: [level] });

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
          EducationSchema,
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
    async <Field extends DeepKeys<EducationSchema>>(
      fieldGroup: EducationSchema["i18n"][number],
      fieldName: Field,
      fieldValue: DeepValue<EducationSchema, Field>
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
          EducationSchema,
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
      <Field name="level">
        {(field) => (
          <SelectInput
            error={fieldError(field.state.meta)}
            label="Level"
            name={field.name}
            onChange={(value) => field.handleChange(value as EducationLevel)}
            options={LEVEL_OPTIONS}
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
            onChange={(value) => field.handleChange(value as EducationStatus)}
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
      <Field name="period">
        {(field) => (
          <DateRangeInput
            error={fieldError(field.state.meta)}
            label="Period"
            onChange={field.handleChange}
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
                      placeholder={PLACEHOLDERS.educationTitle}
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
              {state === "UPDATING" ? "Update Education" : "Create Education"}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
