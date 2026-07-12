import { DeepKeys, DeepValue, useForm } from "@tanstack/react-form";
import lodash from "lodash";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import z from "zod";
import { FormDivider } from "@/components/inputs/divider";
import { FieldArray } from "@/components/inputs/field-array";
import { SelectInput } from "@/components/inputs/select";
import { TextInput } from "@/components/inputs/text";
import { TextareaInput } from "@/components/inputs/textarea";
import { LOCALES } from "@/consts/locales";
import { RawSizeEnum } from "@/consts/raw-size";
import { SLUG_REGEX } from "@/consts/regex";
import {
  CreateOrganizationInput,
  DetailInput,
  OrganizationCategory,
  ResourceType,
} from "@/generated/graphql/graphql";
import { useSummarize, useTranslate } from "@/hooks/mutations/ai";
import { OrganizationRow } from "@/hooks/queries/organizations";
import { fieldError } from "@/lib/field-error";
import { FormError } from "@/lib/form-errors";
import { hasUniqueLocales } from "@/lib/form-validation";
import { createEmptyI18n } from "@/lib/i18n";
import { isSlugTaken } from "@/lib/slug";
import { CommonFormProps } from "./common";

const organizationSchema = z.object({
  slug: z
    .string()
    .min(1, FormError.requiredField)
    .regex(SLUG_REGEX, FormError.invalidFormat),
  name: z.string().min(1, FormError.requiredField),
  category: z.enum(OrganizationCategory, FormError.requiredField),
  logo: z.union([z.url(FormError.invalidFormat), z.literal("")]),
  website: z.union([z.url(FormError.invalidFormat), z.literal("")]),
  i18n: z
    .array(
      z.object({
        locale: z.string().min(1, FormError.requiredField),
        description: z.string().min(1, FormError.requiredField),
      })
    )
    .min(1, FormError.requiredGroup)
    .refine(hasUniqueLocales, { message: FormError.uniqueField }),
});

export type OrganizationSchema = z.infer<typeof organizationSchema>;

export interface OrganizationFormProps
  extends CommonFormProps<OrganizationSchema> {
  slugsList?: string[];
}

export function organizationToInput(
  data: OrganizationSchema
): CreateOrganizationInput {
  return {
    name: data.name,
    slug: data.slug,
    category: data.category,
    logo: data.logo,
    website: data.website,
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
    logo: organization.logo ?? "",
    website: organization.website ?? "",
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
  slugsList,
  isLoading,
  state,
}: OrganizationFormProps) {
  const { t: tForm } = useTranslation("forms");
  const { t: tValidation } = useTranslation("validation");
  const { t: tAction } = useTranslation("actions");

  const [isNameEdited, setIsNameEdited] = useState(!!defaultValues?.name);

  const summarize = useSummarize();
  const translate = useTranslate();

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      category: OrganizationCategory.Company,
      logo: "",
      website: "",
      i18n: createEmptyI18n({ description: "" }),
      ...defaultValues,
    },
    onSubmit: ({ value }) => onSubmit?.(value),
    validators: { onChange: organizationSchema },
  });

  const handleAtsOptimize = useCallback(
    async <Field extends DeepKeys<OrganizationSchema>>(
      fieldGroup: OrganizationSchema["i18n"][number],
      fieldName: Field,
      fieldValue: DeepValue<OrganizationSchema, Field>
    ) => {
      const details: DetailInput[] = [];

      const raw = fieldValue as string;
      const type = ResourceType.Organization;

      if (raw.trim().length <= RawSizeEnum.XSMALL)
        return toast.error(tValidation("minLength", { value: 64 }));

      const name = form.getFieldValue("name");
      if (name) details.push({ key: "Name", value: [name] });

      const category = form.getFieldValue("category");
      if (category) details.push({ key: "Category", value: [category] });

      const website = form.getFieldValue("website");
      if (website) details.push({ key: "Website", value: [website] });

      const language = fieldGroup.locale;
      if (language) details.push({ key: "Language", value: [language] });

      const summarized = await summarize.mutateAsync({
        raw,
        type,
        details,
      });

      form.setFieldValue(
        fieldName,
        summarized.summarize.messages[0].message.content as DeepValue<
          OrganizationSchema,
          Field
        >
      );
    },
    [summarize.mutateAsync, form.getFieldValue, form.setFieldValue, tValidation]
  );

  const handleTranslate = useCallback(
    async <Field extends DeepKeys<OrganizationSchema>>(
      fieldGroup: OrganizationSchema["i18n"][number],
      fieldName: Field,
      fieldValue: DeepValue<OrganizationSchema, Field>
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
          OrganizationSchema,
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
        listeners={{
          onChange: ({ value }) => {
            if (!isNameEdited) {
              form.setFieldValue("name", lodash.startCase(value));
            }
          },
        }}
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
      <Field name="name">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label={tForm("fields.organizationName.label")}
            name={field.name}
            onChange={(value) => {
              setIsNameEdited(true);
              field.handleChange(value);
            }}
            placeholder={tForm("fields.organizationName.placeholder")}
            tooltip={tForm("fields.organizationName.tooltip")}
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="category">
        {(field) => (
          <SelectInput
            error={fieldError(field.state.meta)}
            label={tForm("fields.organizationCategory.label")}
            name={field.name}
            onChange={(value) =>
              field.handleChange(value as OrganizationCategory)
            }
            options={CATEGORY_OPTIONS}
            placeholder={tForm("fields.organizationCategory.placeholder")}
            tooltip={tForm("fields.organizationCategory.tooltip")}
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="logo">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label={tForm("fields.logo.label")}
            name={field.name}
            onChange={field.handleChange}
            placeholder={tForm("fields.logo.placeholder")}
            tooltip={tForm("fields.logo.tooltip")}
            value={field.state.value}
          />
        )}
      </Field>
      <Field name="website">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label={tForm("fields.website.label")}
            name={field.name}
            onChange={field.handleChange}
            placeholder={tForm("fields.website.placeholder")}
            tooltip={tForm("fields.website.tooltip")}
            value={field.state.value}
          />
        )}
      </Field>

      <FormDivider label={tForm("sections.translations")} />

      <Field mode="array" name="i18n">
        {(arrayField) => (
          <FieldArray
            error={fieldError(arrayField.state.meta)}
            label={tForm("fields.translation.label")}
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
                <Field name={`i18n[${index}].description`}>
                  {(field) => (
                    <TextareaInput
                      disabled={summarize.isPending || translate.isPending}
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
                ? tForm("submit.updateOrganization")
                : tForm("submit.createOrganization")}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
