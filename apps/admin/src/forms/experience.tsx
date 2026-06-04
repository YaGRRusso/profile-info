import { DeepKeys, DeepValue, useForm } from "@tanstack/react-form";
import { useCallback } from "react";
import { toast } from "react-toastify";
import z from "zod";
import { DateRangeInput } from "@/components/inputs/date-range";
import { FieldArray } from "@/components/inputs/field-array";
import { MultiSelectInput } from "@/components/inputs/multi-select";
import { RangeInput } from "@/components/inputs/range";
import { SelectInput } from "@/components/inputs/select";
import { TextInput } from "@/components/inputs/text";
import { TextareaInput } from "@/components/inputs/textarea";
import { LOCALES, LocaleEnum } from "@/consts/locales";
import {
  type CreateExperienceInput,
  ExperienceCategory,
} from "@/graphql/graphql";
import { useQueryAllPages } from "@/hooks/custom/use-query-all-pages";
import { useAtsSummarize } from "@/hooks/mutations/ai";
import type { ExperienceRow } from "@/hooks/queries/experiences";
import { useFindManyOrganizations } from "@/hooks/queries/organizations";
import { useFindManySkills } from "@/hooks/queries/skills";
import { toDateInput, toIsoDate } from "@/lib/date";
import { fieldError } from "@/lib/field-error";
import { findLabelById, findLabelsByIds } from "@/lib/mappers";
import { CommonFormProps } from "./common";

const experienceSchema = z.object({
  slug: z.string().min(1, "required field"),
  organization: z.string().min(1, "required field"),
  category: z.enum(ExperienceCategory, "required field"),
  relevance: z.number().min(1, "must be a positive number"),
  roles: z
    .array(
      z.object({
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
          .refine(
            (range) => !(range.from && range.to) || range.from <= range.to,
            { message: "end date must be after start date" }
          ),
        skills: z.array(z.string()),
      })
    )
    .min(1, "required group"),
});

export type ExperienceSchema = z.infer<typeof experienceSchema>;

export interface ExperienceFormProps
  extends CommonFormProps<ExperienceSchema> {}

export function experienceToInput(
  data: ExperienceSchema
): CreateExperienceInput {
  return {
    slug: data.slug,
    organization: data.organization,
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
        role.period.from || role.period.to
          ? { from: toIsoDate(role.period.from), to: toIsoDate(role.period.to) }
          : undefined,
      skills: role.skills.length ? role.skills : undefined,
    })),
  };
}

export function experienceToForm(
  experience: ExperienceRow
): Partial<ExperienceSchema> {
  return {
    slug: experience.slug,
    organization: experience.organization?.id ?? "",
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
      skills: (role.skills ?? []).map((skill) => skill.id),
    })),
  };
}

const CATEGORY_OPTIONS = Object.values(ExperienceCategory).map((category) => ({
  label: category,
  value: category,
}));

function emptyRole() {
  return {
    i18n: [
      { locale: LocaleEnum.PORTUGUESE, title: "", description: "" },
      { locale: LocaleEnum.ENGLISH, title: "", description: "" },
    ],
    period: { from: "", to: "" },
    skills: [] as string[],
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
  const findManyOrganizations = useFindManyOrganizations();
  useQueryAllPages(findManyOrganizations);

  const findManySkills = useFindManySkills();
  useQueryAllPages(findManySkills);

  const atsSummarize = useAtsSummarize();

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
      organization: "",
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
      const raw = fieldValue as string;
      const type = "experience";

      const skills = findLabelsByIds({
        items: findManySkills.data?.nodes,
        lookupKey: "id",
        labelKey: "name",
        targetValues: fieldParent.skills,
      });
      if (!skills.length) return toast.error("At least one skill is required");

      const title = fieldGroup.title;
      if (!title) return toast.error("Title is required");
      const titleDetail = `Title: ${fieldGroup.title}`;

      const period = fieldParent.period;
      if (!period.from && !period.to) return toast.error("Period is required");
      const periodDetail = `Period: from ${period.from} to ${period.to}`;

      const category = form.getFieldValue("category");
      if (!category) return toast.error("Category is required");
      const categoryDetail = `Category: ${category}`;

      const organization = findLabelById({
        items: findManyOrganizations.data?.nodes,
        lookupKey: "id",
        labelKey: "name",
        targetValue: form.getFieldValue("organization"),
      });
      if (!organization) return toast.error("Organization is required");
      const organizationDetail = `Organization: ${organization}`;

      const details = [
        titleDetail,
        periodDetail,
        categoryDetail,
        organizationDetail,
      ];

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
    ]
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
      <Field name="slug">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label="Slug"
            name={field.name}
            onChange={field.handleChange}
            placeholder="Slug"
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="organization">
        {(field) => (
          <SelectInput
            disabled={!organizationOptions.length}
            error={fieldError(field.state.meta)}
            label="Organization"
            name={field.name}
            onChange={field.handleChange}
            options={organizationOptions}
            placeholder="Organization"
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="category">
        {(field) => (
          <SelectInput
            error={fieldError(field.state.meta)}
            label="Category"
            name={field.name}
            onChange={(value) =>
              field.handleChange(value as ExperienceCategory)
            }
            options={CATEGORY_OPTIONS}
            placeholder="Category"
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
            placeholder="Relevance"
            ruler
            step={1}
            value={field.state.value}
          />
        )}
      </Field>

      <div className="divider">Roles</div>

      <Field mode="array" name="roles">
        {(rolesField) => (
          <FieldArray
            error={fieldError(rolesField.state.meta)}
            label="Role"
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
                      label="Period"
                      onChange={field.handleChange}
                      value={field.state.value}
                    />
                  )}
                </Field>

                <Field name={`roles[${roleIndex}].skills`}>
                  {(field) => (
                    <MultiSelectInput
                      error={fieldError(field.state.meta)}
                      label="Skills"
                      onChange={field.handleChange}
                      options={skillOptions}
                      placeholder="Select skills"
                      value={field.state.value}
                    />
                  )}
                </Field>

                <div className="divider">Translations</div>

                <Field mode="array" name={`roles[${roleIndex}].i18n`}>
                  {(i18nField) => (
                    <FieldArray
                      error={fieldError(i18nField.state.meta)}
                      label="Translation"
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
                                label="Locale"
                                name={field.name}
                                onChange={field.handleChange}
                                options={LOCALES}
                                placeholder="Locale"
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
                                label="Title"
                                name={field.name}
                                onChange={field.handleChange}
                                placeholder="Title"
                                value={field.state.value}
                              />
                            )}
                          </Field>
                          <Field
                            name={`roles[${roleIndex}].i18n[${i18nIndex}].description`}
                          >
                            {(field) => (
                              <TextareaInput
                                disabled={atsSummarize.isPending}
                                error={fieldError(field.state.meta)}
                                label="Description"
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
                                placeholder="Description"
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
              {state === "UPDATING" ? "Update Experience" : "Create Experience"}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
