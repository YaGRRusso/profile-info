import { useForm } from "@tanstack/react-form";
import z from "zod";
import { NumberInput } from "@/components/inputs/number";
import { RangeInput } from "@/components/inputs/range";
import { SelectInput } from "@/components/inputs/select";
import { TextInput } from "@/components/inputs/text";
import { CourseStatus, CourseType } from "@/graphql/graphql";
import { useQueryAllPages } from "@/hooks/custom/use-query-all-pages";
import { useFindManyOrganizations } from "@/hooks/queries/organizations";
import { fieldError } from "@/lib/field-error";
import { CommonFormProps } from "./common";

const courseSchema = z.object({
  slug: z.string().min(1, "required field"),
  organization: z.string().min(1, "required field"),
  type: z.enum(CourseType, "required field"),
  status: z.enum(CourseStatus, "required field"),
  relevance: z.number().min(1, "must be a positive number"),
  url: z.url(),
  image: z.url(),
  hours: z.number(),
  locale: z.string().min(1, "required field"),
  title: z.string().min(1, "required field"),
  description: z.string().min(1, "required field"),
});

export type CourseSchema = z.infer<typeof courseSchema>;

export interface CourseFormProps extends CommonFormProps<CourseSchema> {}

const TYPE_OPTIONS = Object.values(CourseType).map((type) => ({
  label: type,
  value: type,
}));

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
  state,
}: CourseFormProps) {
  const findManyOrganizations = useFindManyOrganizations();
  useQueryAllPages(findManyOrganizations);

  const organizationOptions = (findManyOrganizations.data?.nodes ?? []).map(
    (organization) => ({ label: organization.name, value: organization.id })
  );

  const form = useForm({
    defaultValues: {
      slug: "",
      organization: "",
      type: CourseType.Online,
      status: CourseStatus.Complete,
      relevance: 1,
      url: "",
      image: "",
      hours: 0,
      locale: "en",
      title: "",
      description: "",
      ...defaultValues,
    },
    onSubmit: ({ value }) => onSubmit?.(value),
    validators: { onChange: courseSchema },
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
            name={field.name}
            onChange={field.handleChange}
            options={organizationOptions}
            placeholder="Organization"
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="type">
        {(field) => (
          <SelectInput
            error={fieldError(field.state.meta)}
            name={field.name}
            onChange={(value) => field.handleChange(value as CourseType)}
            options={TYPE_OPTIONS}
            placeholder="Type"
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="status">
        {(field) => (
          <SelectInput
            error={fieldError(field.state.meta)}
            name={field.name}
            onChange={(value) => field.handleChange(value as CourseStatus)}
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
            name={field.name}
            onChange={field.handleChange}
            placeholder="Image"
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="hours">
        {(field) => (
          <NumberInput
            error={fieldError(field.state.meta)}
            min={0}
            name={field.name}
            onChange={field.handleChange}
            placeholder="Hours"
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="relevance">
        {(field) => (
          <RangeInput
            className="range-xs"
            error={fieldError(field.state.meta)}
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

      <div className="divider">Translation</div>

      <Field name="locale">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            name={field.name}
            onChange={field.handleChange}
            placeholder="Locale"
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="title">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            name={field.name}
            onChange={field.handleChange}
            placeholder="Title"
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="description">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            name={field.name}
            onChange={field.handleChange}
            placeholder="Description"
            value={field.state.value}
          />
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
