import { DeepKeys, DeepValue, useForm } from "@tanstack/react-form";
import { compact } from "lodash";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import { DateRangeInput } from "@/components/inputs/date-range";
import { FormDivider } from "@/components/inputs/divider";
import { FieldArray } from "@/components/inputs/field-array";
import { MultiSelectInput } from "@/components/inputs/multi-select";
import { RangeInput } from "@/components/inputs/range";
import { SelectInput } from "@/components/inputs/select";
import { TextInput } from "@/components/inputs/text";
import { TextareaInput } from "@/components/inputs/textarea";
import { RawSizeEnum } from "@/consts/raw-size";
import { SLUG_REGEX } from "@/consts/regex";
import {
  type CreateExperienceInput,
  DetailInput,
  ExperienceCategory,
  ResourceType,
} from "@/generated/graphql/graphql";
import { useQueryAllPages } from "@/hooks/custom/use-query-all-pages";
import { useAtsSummarize, useTranslate } from "@/hooks/mutations/ai";
import type { ExperienceRow } from "@/hooks/queries/experiences";
import { useFindManyOrganizations } from "@/hooks/queries/organizations";
import { useFindManySkills } from "@/hooks/queries/skills";
import { useUserLocaleOptions } from "@/hooks/use-user-locale-options";
import { toDateInput, toIsoDate } from "@/lib/date";
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

const experienceSchema = z.object({
  category: z.enum(ExperienceCategory, FormError.requiredField),
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
  organizationId: z.string().min(1, FormError.requiredField),
  period: z
    .object({ from: z.string(), to: z.string() })
    .refine((range) => !(range.from && range.to) || range.from <= range.to, {
      message: FormError.invalidRange,
    }),
  relevance: z.number().min(1, FormError.minValue),
  skillIds: z.array(z.string()),
  slug: z.string().regex(SLUG_REGEX, FormError.invalidFormat).or(z.literal("")),
});

export type ExperienceSchema = z.infer<typeof experienceSchema>;

export interface ExperienceFormProps extends CommonFormProps<ExperienceSchema> {
  slugsList?: string[];
}

export function experienceToInput(
  data: ExperienceSchema
): CreateExperienceInput {
  return {
    category: data.category,
    i18n: data.i18n.map((translation) => ({
      locale: translation.locale,
      messages: {
        description: translation.description,
        title: translation.title,
      },
    })),
    organizationId: data.organizationId,
    period:
      !data.period.from && !data.period.to
        ? null
        : {
            from: nullIfEmpty(toIsoDate(data.period.from)),
            to: nullIfEmpty(toIsoDate(data.period.to)),
          },
    relevance: data.relevance,
    skillIds: nullIfEmpty(data.skillIds),
    slug: nullIfEmpty(data.slug),
  };
}

export function experienceToForm(
  experience: ExperienceRow
): Partial<ExperienceSchema> {
  return {
    category: experience.category,
    i18n: experience.i18n.map((translation) => ({
      description: translation.messages.description,
      locale: translation.locale,
      title: translation.messages.title,
    })),
    organizationId: experience.organization?.id ?? "",
    period: {
      from: toDateInput(experience.period?.from),
      to: toDateInput(experience.period?.to),
    },
    relevance: experience.relevance,
    skillIds: (experience.skills ?? []).map((skill) => skill.id),
    slug: experience.slug ?? "",
  };
}

const CATEGORY_OPTIONS = Object.values(ExperienceCategory).map((category) => ({
  label: category,
  value: category,
}));

export function ExperienceForm({
  onSubmit,
  onCancel,
  defaultValues,
  isDisabled,
  isLoading,
  slugsList,
  state,
}: ExperienceFormProps) {
  const { t: tForm } = useTranslation("forms");
  const localeOptions = useUserLocaleOptions();
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
      category: ExperienceCategory.FullTime,
      i18n: createEmptyI18n({ description: "", title: "" }),
      organizationId: "",
      period: { from: "", to: "" },
      relevance: 1,
      skillIds: Array.of<string>(),
      slug: "",
      ...defaultValues,
    },
    onSubmit: ({ value }) => onSubmit?.(value),
    validators: { onChange: experienceSchema },
  });

  const handleAtsOptimize = useCallback(
    async <Field extends DeepKeys<ExperienceSchema>>(
      fieldGroup: ExperienceSchema["i18n"][number],
      fieldName: Field,
      fieldValue: DeepValue<ExperienceSchema, Field>
    ) => {
      const details: DetailInput[] = [];

      const raw = fieldValue as string;
      const type = ResourceType.Experience;

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

      const period = form.getFieldValue("period");
      if (period?.from || period?.to)
        details.push({
          key: "Period",
          value: compact([
            period.from ? `from ${period.from}` : "",
            period.to ? `to ${period.to}` : "",
          ]),
        });

      const category = form.getFieldValue("category");
      if (category) details.push({ key: "Category", value: [category] });

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

      const summarized = await atsSummarize.mutateAsync({
        details,
        raw,
        skills,
        type,
      });

      form.setFieldValue(
        fieldName,
        summarized.atsSummarize.messages[0].message.content as DeepValue<
          ExperienceSchema,
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
    async <Field extends DeepKeys<ExperienceSchema>>(
      fieldGroup: ExperienceSchema["i18n"][number],
      fieldName: Field,
      fieldValue: DeepValue<ExperienceSchema, Field>
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
          ExperienceSchema,
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
      <Field name="category">
        {(field) => (
          <SelectInput
            error={fieldError(field.state.meta)}
            label={tForm("fields.experienceCategory.label")}
            name={field.name}
            onChange={field.handleChange}
            options={CATEGORY_OPTIONS}
            placeholder={tForm("fields.experienceCategory.placeholder")}
            tooltip={tForm("fields.experienceCategory.tooltip")}
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
      <Field name="period">
        {(field) => (
          <DateRangeInput
            error={fieldError(field.state.meta)}
            label={tForm("fields.period.label")}
            onChange={field.handleChange}
            optional
            tooltip={tForm("fields.period.tooltip")}
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
                      options={localeOptions}
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
                      label={tForm("fields.experienceTitle.label")}
                      name={field.name}
                      onChange={field.handleChange}
                      placeholder={tForm("fields.experienceTitle.placeholder")}
                      tooltip={tForm("fields.experienceTitle.tooltip")}
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
                ? tForm("submit.updateExperience")
                : tForm("submit.createExperience")}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
