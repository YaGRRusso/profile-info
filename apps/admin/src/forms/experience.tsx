import { DeepKeys, DeepValue, useForm } from "@tanstack/react-form";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import z from "zod";
import { DateRangeInput } from "@/components/inputs/date-range";
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
import { toDateInput, toIsoDate } from "@/lib/date";
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
import { CommonFormProps } from "./common";

const roleI18nSchema = z
  .array(
    z.object({
      locale: z.string().min(1, FormError.requiredField),
      title: z.string().min(1, FormError.requiredField),
      description: z.string().min(1, FormError.requiredField),
    })
  )
  .min(1, FormError.requiredGroup)
  .refine(hasUniqueLocales, { message: FormError.uniqueField });

const experienceSchema = z.object({
  slug: z.string().regex(SLUG_REGEX, FormError.invalidFormat).or(z.literal("")),
  organizationId: z.string().min(1, FormError.requiredField),
  category: z.enum(ExperienceCategory, FormError.requiredField),
  relevance: z.number().min(1, FormError.minValue),
  roles: z
    .array(
      z.object({
        i18n: roleI18nSchema,
        period: z
          .object({ from: z.string(), to: z.string() })
          .refine(
            (range) => !(range.from && range.to) || range.from <= range.to,
            { message: FormError.invalidRange }
          ),
        skillIds: z.array(z.string()),
      })
    )
    .min(1, FormError.requiredGroup),
});

export type ExperienceSchema = z.infer<typeof experienceSchema>;

export interface ExperienceFormProps extends CommonFormProps<ExperienceSchema> {
  slugsList?: string[];
}

export function experienceToInput(
  data: ExperienceSchema
): CreateExperienceInput {
  return {
    slug: nullIfEmpty(data.slug),
    organizationId: data.organizationId,
    category: data.category,
    relevance: data.relevance,
    roles: data.roles.map((role) => ({
      i18n: role.i18n.map((translation) => ({
        locale: translation.locale,
        messages: {
          title: translation.title,
          description: translation.description,
        },
      })),
      period:
        !role.period.from && !role.period.to
          ? null
          : {
              from: nullIfEmpty(toIsoDate(role.period.from)),
              to: nullIfEmpty(toIsoDate(role.period.to)),
            },
      skillIds: nullIfEmpty(role.skillIds),
    })),
  };
}

export function experienceToForm(
  experience: ExperienceRow
): Partial<ExperienceSchema> {
  return {
    slug: experience.slug ?? "",
    organizationId: experience.organization?.id ?? "",
    category: experience.category,
    relevance: experience.relevance,
    roles: (experience.roles ?? []).map((role) => ({
      i18n: role.i18n.map((translation) => ({
        locale: translation.locale,
        title: translation.messages.title,
        description: translation.messages.description,
      })),
      period: {
        from: toDateInput(role.period?.from),
        to: toDateInput(role.period?.to),
      },
      skillIds: (role.skills ?? []).map((skill) => skill.id),
    })),
  };
}

const CATEGORY_OPTIONS = Object.values(ExperienceCategory).map((category) => ({
  label: category,
  value: category,
}));

function emptyRole() {
  return {
    i18n: createEmptyI18n({ title: "", description: "" }),
    period: { from: "", to: "" },
    skillIds: [] as string[],
  };
}

export function ExperienceForm({
  onSubmit,
  onCancel,
  defaultValues,
  isDisabled,
  isLoading,
  state,
}: ExperienceFormProps) {
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
      category: ExperienceCategory.FullTime,
      relevance: 1,
      roles: [emptyRole()],
      ...defaultValues,
    },
    onSubmit: ({ value }) => onSubmit?.(value),
    validators: { onChange: experienceSchema },
  });

  const handleAtsOptimize = useCallback(
    async <Field extends DeepKeys<ExperienceSchema>>(
      fieldParent: ExperienceSchema["roles"][number],
      fieldGroup: ExperienceSchema["roles"][number]["i18n"][number],
      fieldName: Field,
      fieldValue: DeepValue<ExperienceSchema, Field>
    ) => {
      const details: DetailInput[] = [];

      const raw = fieldValue as string;
      const type = ResourceType.Experience;

      if (raw.trim().length <= RawSizeEnum.XSMALL)
        return toast.error(tValidation("minLength", { value: 32 }));

      const skills = i18nLabelsByIds(
        findManySkills.data?.nodes,
        fieldParent.skillIds
      );
      if (!skills.length)
        return toast.error(tValidation("minCount", { value: 1 }));

      const title = fieldGroup.title;
      if (!title) return toast.error(tValidation("requiredField"));
      details.push({ key: "Title", value: [title] });

      const period = fieldParent.period;
      if (!period.from && !period.to)
        return toast.error(tValidation("requiredField"));
      details.push({
        key: "Period",
        value: [
          period.from ? `from ${period.from}` : "",
          period.to ? `to ${period.to}` : "",
        ].filter(Boolean),
      });

      const category = form.getFieldValue("category");
      if (!category) return toast.error(tValidation("requiredField"));
      details.push({ key: "Category", value: [category] });

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

      const summarized = await atsSummarize.mutateAsync({
        raw,
        type,
        skills,
        details,
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
      fieldGroup: ExperienceSchema["roles"][number]["i18n"][number],
      fieldName: Field,
      fieldValue: DeepValue<ExperienceSchema, Field>
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
      {/* TODO: slug field hidden temporarily
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
      */}
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
            onChange={(value) =>
              field.handleChange(value as ExperienceCategory)
            }
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

      <FormDivider
        label={tForm("sections.roles.title.label")}
        tooltip={tForm("sections.roles.title.tooltip")}
      />

      <Field mode="array" name="roles">
        {(rolesField) => (
          <FieldArray
            error={fieldError(rolesField.state.meta)}
            label={tForm("fields.role.label")}
            onAdd={() => rolesField.pushValue(emptyRole())}
            onMoveDown={(index) => rolesField.swapValues(index, index + 1)}
            onMoveUp={(index) => rolesField.swapValues(index, index - 1)}
            onRemove={(index) => rolesField.removeValue(index)}
            values={rolesField.state.value}
          >
            {(roleIndex) => (
              <>
                <Field name={`roles[${roleIndex}].period`}>
                  {(field) => (
                    <DateRangeInput
                      error={fieldError(field.state.meta)}
                      label={tForm("fields.period.label")}
                      onChange={field.handleChange}
                      tooltip={tForm("fields.period.tooltip")}
                      value={field.state.value}
                    />
                  )}
                </Field>

                <Field name={`roles[${roleIndex}].skillIds`}>
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
                  label={tForm("sections.roles.translations.label")}
                  tooltip={tForm("sections.roles.translations.tooltip")}
                />

                <Field mode="array" name={`roles[${roleIndex}].i18n`}>
                  {(i18nField) => (
                    <FieldArray
                      error={fieldError(i18nField.state.meta)}
                      label={tForm("fields.translation.label")}
                      onAdd={() =>
                        i18nField.pushValue({
                          locale: "",
                          title: "",
                          description: "",
                        })
                      }
                      onRemove={(index) => i18nField.removeValue(index)}
                      sublevel
                      values={i18nField.state.value}
                    >
                      {(i18nIndex) => (
                        <>
                          <Field
                            name={`roles[${roleIndex}].i18n[${i18nIndex}].locale`}
                          >
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
                          <Field
                            name={`roles[${roleIndex}].i18n[${i18nIndex}].title`}
                          >
                            {(field) => (
                              <TextInput
                                error={fieldError(field.state.meta)}
                                label={tForm("fields.experienceTitle.label")}
                                name={field.name}
                                onChange={field.handleChange}
                                placeholder={tForm(
                                  "fields.experienceTitle.placeholder"
                                )}
                                tooltip={tForm(
                                  "fields.experienceTitle.tooltip"
                                )}
                                value={field.state.value}
                              />
                            )}
                          </Field>
                          <Field
                            name={`roles[${roleIndex}].i18n[${i18nIndex}].description`}
                          >
                            {(field) => (
                              <TextareaInput
                                disabled={
                                  atsSummarize.isPending || translate.isPending
                                }
                                error={fieldError(field.state.meta)}
                                label={tForm("fields.description.label")}
                                name={field.name}
                                onChange={field.handleChange}
                                onOptimize={() =>
                                  handleAtsOptimize(
                                    rolesField.state.value[roleIndex],
                                    i18nField.state.value[i18nIndex],
                                    field.name,
                                    field.state.value
                                  )
                                }
                                onTranslate={() =>
                                  handleTranslate(
                                    rolesField.state.value[roleIndex].i18n[
                                      i18nIndex
                                    ],
                                    field.name,
                                    field.state.value
                                  )
                                }
                                placeholder={tForm(
                                  "fields.description.placeholder"
                                )}
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
