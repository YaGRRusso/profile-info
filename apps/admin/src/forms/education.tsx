import { useForm } from "@tanstack/react-form";
import z from "zod";
import { DateRangeInput } from "@/components/inputs/date-range";
import { FieldArray } from "@/components/inputs/field-array";
import { MultiSelectInput } from "@/components/inputs/multi-select";
import { RangeInput } from "@/components/inputs/range";
import { SelectInput } from "@/components/inputs/select";
import { TextInput } from "@/components/inputs/text";
import {
  type CreateEducationInput,
  EducationLevel,
  EducationStatus,
} from "@/graphql/graphql";
import { useQueryAllPages } from "@/hooks/custom/use-query-all-pages";
import type { EducationRow } from "@/hooks/queries/educations";
import { useFindManyOrganizations } from "@/hooks/queries/organizations";
import { useFindManySkills } from "@/hooks/queries/skills";
import { toDateInput, toIsoDate } from "@/lib/date";
import { fieldError } from "@/lib/field-error";
import { CommonFormProps } from "./common";

const educationSchema = z.object({
  slug: z.string().min(1, "required field"),
  organization: z.string().min(1, "required field"),
  level: z.enum(EducationLevel, "required field"),
  status: z.enum(EducationStatus, "required field"),
  relevance: z.number().min(1, "must be a positive number"),
  url: z.url().or(z.literal("")),
  image: z.url().or(z.literal("")),
  skills: z.array(z.string()),
  i18n: z
    .array(
      z.object({
        locale: z.string().min(1, "required field"),
        title: z.string().min(1, "required field"),
        description: z.string().min(1, "required field"),
      })
    )
    .min(1, "required group"),
  period: z
    .object({ from: z.string(), to: z.string() })
    .refine((range) => !(range.from && range.to) || range.from <= range.to, {
      message: "end date must be after start date",
    }),
});

export type EducationSchema = z.infer<typeof educationSchema>;

export interface EducationFormProps extends CommonFormProps<EducationSchema> {}

export function educationToInput(data: EducationSchema): CreateEducationInput {
  const period =
    data.period.from || data.period.to
      ? { from: toIsoDate(data.period.from), to: toIsoDate(data.period.to) }
      : undefined;

  return {
    slug: data.slug,
    organization: data.organization,
    level: data.level,
    status: data.status,
    relevance: data.relevance,
    url: data.url || undefined,
    image: data.image || undefined,
    skills: data.skills.length ? data.skills : undefined,
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
    organization: education.organization?.id ?? "",
    level: education.level,
    status: education.status,
    relevance: education.relevance,
    url: education.url ?? "",
    image: education.image ?? "",
    skills: (education.skills ?? []).map((skill) => skill.id),
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
  isLoading,
  state,
}: EducationFormProps) {
  const findManyOrganizations = useFindManyOrganizations();
  useQueryAllPages(findManyOrganizations);

  const findManySkills = useFindManySkills();
  useQueryAllPages(findManySkills);

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
      level: EducationLevel.Bachelor,
      status: EducationStatus.Complete,
      relevance: 1,
      url: "",
      image: "",
      skills: [] as string[],
      period: { from: "", to: "" },
      i18n: [{ locale: "", title: "", description: "" }],
      ...defaultValues,
    },
    onSubmit: ({ value }) => onSubmit?.(value),
    validators: { onChange: educationSchema },
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
      <Field name="level">
        {(field) => (
          <SelectInput
            error={fieldError(field.state.meta)}
            label="Level"
            name={field.name}
            onChange={(value) => field.handleChange(value as EducationLevel)}
            options={LEVEL_OPTIONS}
            placeholder="Level"
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
            placeholder="Status"
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
            placeholder="URL"
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
            placeholder="Image"
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
      <Field name="skills">
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
                    <TextInput
                      error={fieldError(field.state.meta)}
                      label="Locale"
                      name={field.name}
                      onChange={field.handleChange}
                      placeholder="Locale"
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
                      placeholder="Title"
                      value={field.state.value}
                    />
                  )}
                </Field>
                <Field name={`i18n[${index}].description`}>
                  {(field) => (
                    <TextInput
                      error={fieldError(field.state.meta)}
                      label="Description"
                      name={field.name}
                      onChange={field.handleChange}
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
              {state === "UPDATING" ? "Update Education" : "Create Education"}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
