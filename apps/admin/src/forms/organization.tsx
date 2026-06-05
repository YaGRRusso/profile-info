import { useForm } from "@tanstack/react-form";
import z from "zod";
import { FieldArray } from "@/components/inputs/field-array";
import { RangeInput } from "@/components/inputs/range";
import { SelectInput } from "@/components/inputs/select";
import { TextInput } from "@/components/inputs/text";
import { TextareaInput } from "@/components/inputs/textarea";
import { LOCALES, LocaleEnum } from "@/consts/locales";
import {
  CreateOrganizationInput,
  OrganizationCategory,
} from "@/graphql/graphql";
import { OrganizationRow } from "@/hooks/queries/organizations";
import { fieldError } from "@/lib/field-error";
import { CommonFormProps } from "./common";

const organizationSchema = z.object({
  name: z.string().min(1, "required field"),
  slug: z.string().min(1, "required field"),
  category: z.enum(OrganizationCategory, "required field"),
  logo: z.url(),
  website: z.url(),
  relevance: z.number().min(1, "must be a positive number"),
  i18n: z
    .array(
      z.object({
        locale: z.string().min(1, "required field"),
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

export type OrganizationSchema = z.infer<typeof organizationSchema>;

export interface OrganizationFormProps
  extends CommonFormProps<OrganizationSchema> {}

export function organizationToInput(
  data: OrganizationSchema
): CreateOrganizationInput {
  return {
    name: data.name,
    slug: data.slug,
    category: data.category,
    logo: data.logo,
    website: data.website,
    relevance: data.relevance,
    i18n: data.i18n.map((translation) => ({
      locale: translation.locale,
      messages: {
        description: translation.description,
      },
    })),
  };
}

export function organizationToForm(
  organization: OrganizationRow
): Partial<OrganizationSchema> {
  return {
    name: organization.name,
    slug: organization.slug,
    category: organization.category,
    logo: organization.logo,
    website: organization.website,
    relevance: organization.relevance,
    i18n: organization.i18n.map((translation) => ({
      locale: translation.locale,
      description: translation.messages.description,
    })),
  };
}

const CATEGORY_OPTIONS = Object.values(OrganizationCategory).map(
  (category) => ({
    label: category,
    value: category,
  })
);

export function OrganizationForm({
  onSubmit,
  onCancel,
  defaultValues,
  isDisabled,
  isLoading,
  state,
}: OrganizationFormProps) {
  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      category: OrganizationCategory.Company,
      logo: "",
      website: "",
      relevance: 1,
      i18n: [
        { locale: LocaleEnum.PORTUGUESE, description: "" },
        { locale: LocaleEnum.ENGLISH, description: "" },
      ],
      ...defaultValues,
    },
    onSubmit: ({ value }) => onSubmit?.(value),
    validators: { onChange: organizationSchema },
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
      <Field name="name">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label="Name"
            name={field.name}
            onChange={field.handleChange}
            placeholder="Name"
            value={field.state.value}
          />
        )}
      </Field>
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
      <Field name="category">
        {(field) => (
          <SelectInput
            error={fieldError(field.state.meta)}
            label="Category"
            name={field.name}
            onChange={(value) =>
              field.handleChange(value as OrganizationCategory)
            }
            options={CATEGORY_OPTIONS}
            placeholder="Category"
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="logo">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label="Logo"
            name={field.name}
            onChange={field.handleChange}
            placeholder="Logo URL"
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="website">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label="Website"
            name={field.name}
            onChange={field.handleChange}
            placeholder="Website URL"
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

      <Field mode="array" name="i18n">
        {(arrayField) => (
          <FieldArray
            error={fieldError(arrayField.state.meta)}
            label="Translation"
            onAdd={() => arrayField.pushValue({ locale: "", description: "" })}
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
                      placeholder="Locale"
                      value={field.state.value}
                    />
                  )}
                </Field>
                <Field name={`i18n[${index}].description`}>
                  {(field) => (
                    <TextareaInput
                      // disabled={atsSummarize.isPending || translate.isPending}
                      error={fieldError(field.state.meta)}
                      label="Description"
                      name={field.name}
                      onChange={field.handleChange}
                      // onOptimize={() =>
                      //   handleAtsOptimize(
                      //     arrayField.state.value[index],
                      //     field.name,
                      //     field.state.value
                      //   )
                      // }
                      // onTranslate={() =>
                      //   handleTranslate(
                      //     arrayField.state.value[index],
                      //     field.name,
                      //     field.state.value
                      //   )
                      // }
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
              {state === "UPDATING"
                ? "Update Organization"
                : "Create Organization"}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
