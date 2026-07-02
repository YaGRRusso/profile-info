import { DeepKeys, DeepValue, useForm } from "@tanstack/react-form";
import { useCallback } from "react";
import { toast } from "react-toastify";
import z from "zod";
import { DraggableList } from "@/components/inputs/draggable-list";
import { FieldArray } from "@/components/inputs/field-array";
import { MultiSelectInput } from "@/components/inputs/multi-select";
import { PasswordInput } from "@/components/inputs/password";
import { SelectInput } from "@/components/inputs/select";
import { TextInput } from "@/components/inputs/text";
import { TextareaInput } from "@/components/inputs/textarea";
import { LOCALES } from "@/consts/locales";
import { PLACEHOLDERS } from "@/consts/placeholders";
import { RawSizeEnum } from "@/consts/raw-size";
import type { GetMeQuery } from "@/generated/graphql/graphql";
import {
  DetailInput,
  ResourceType,
  type UpdateMeInput,
} from "@/generated/graphql/graphql";
import { useQueryAllPages } from "@/hooks/custom/use-query-all-pages";
import { useAtsSummarize, useTranslate } from "@/hooks/mutations/ai";
import { useFindManyActiveSkills } from "@/hooks/queries/skills";
import { toDateInput, toIsoDate } from "@/lib/date";
import { fieldError } from "@/lib/field-error";
import { createEmptyI18n, i18nLabel, i18nLabelsByIds } from "@/lib/i18n";
import { CommonFormProps } from "./common";

const urlSchema = z.object({
  title: z.string().min(1, "required field"),
  value: z.url("invalid url"),
});

const profileSchema = z.object({
  name: z.string().min(1, "required field"),
  nickname: z.string().min(1, "required field"),
  email: z.email("invalid email"),
  phone: z.string(),
  avatar: z.union([z.literal(""), z.url("invalid url")]),
  birth: z.union([z.literal(""), z.string("invalid date")]),
  address: z.string(),
  i18n: z
    .array(
      z.object({
        locale: z.string().min(1, "required field"),
        title: z.string(),
        description: z.string(),
      })
    )
    .refine(
      (items) => {
        const locales = items.map((item) => item.locale);
        return new Set(locales).size === locales.length;
      },
      { message: "locales must be unique" }
    ),
  urls: z.array(urlSchema),
  skillIds: z.array(z.string()),
  password: z.union([
    z.literal(""),
    z.string().min(8, "must be at least 8 characters"),
  ]),
});

export type ProfileSchema = z.infer<typeof profileSchema>;

export const PROFILE_SETTINGS_FORM_ID = "profile-settings-form";

export interface ProfileFormProps extends CommonFormProps<ProfileSchema> {}

type GetMeUser = GetMeQuery["getMe"];

export function profileToForm(user: GetMeUser): Partial<ProfileSchema> {
  return {
    name: user.name,
    nickname: user.nickname,
    email: user.email,
    phone: user.phone ?? "",
    avatar: user.avatar ?? "",
    birth: toDateInput(user.birth),
    address: user.address ?? "",
    i18n: user.i18n?.length
      ? user.i18n.map((translation) => ({
          locale: translation.locale,
          title: translation.messages.title ?? "",
          description: translation.messages.description ?? "",
        }))
      : createEmptyI18n({ title: "", description: "" }),
    urls: (user.urls ?? []).map((url) => ({
      title: url.title,
      value: url.value,
    })),
    skillIds: user.skillIds?.length
      ? [...user.skillIds]
      : (user.skills ?? []).map((skill) => skill.id),
    password: "",
  };
}

export function profileToInput(data: ProfileSchema): UpdateMeInput {
  const i18n = data.i18n
    .filter(
      (translation) =>
        translation.title.trim() || translation.description.trim()
    )
    .map((translation) => ({
      locale: translation.locale,
      messages: {
        title: translation.title || undefined,
        description: translation.description || undefined,
      },
    }));

  return {
    name: data.name,
    nickname: data.nickname,
    email: data.email,
    phone: data.phone || undefined,
    avatar: data.avatar || undefined,
    birth: toIsoDate(data.birth),
    address: data.address || undefined,
    i18n: i18n.length ? i18n : undefined,
    urls: data.urls.length ? data.urls : undefined,
    skillIds: data.skillIds.length ? data.skillIds : undefined,
    password: data.password || undefined,
  };
}

export function ProfileForm({
  onSubmit,
  defaultValues,
  isDisabled,
  isLoading,
}: ProfileFormProps) {
  const findManySkills = useFindManyActiveSkills();
  useQueryAllPages(findManySkills);

  const atsSummarize = useAtsSummarize();
  const translate = useTranslate();

  const skillOptions = (findManySkills.data?.nodes ?? []).map((skill) => ({
    label: i18nLabel(skill),
    value: skill.id,
  }));

  const form = useForm({
    defaultValues: {
      name: "",
      nickname: "",
      email: "",
      phone: "",
      avatar: "",
      birth: "",
      address: "",
      i18n: createEmptyI18n({ title: "", description: "" }),
      urls: [] as ProfileSchema["urls"],
      skillIds: [] as string[],
      password: "",
      ...defaultValues,
    },
    onSubmit: ({ value }) => onSubmit?.(value),
    validators: { onChange: profileSchema },
  });

  const handleAtsOptimize = useCallback(
    async <Field extends DeepKeys<ProfileSchema>>(
      fieldGroup: ProfileSchema["i18n"][number],
      fieldName: Field,
      fieldValue: DeepValue<ProfileSchema, Field>
    ) => {
      const details: DetailInput[] = [];

      const raw = fieldValue as string;
      const type = ResourceType.User;

      if (raw.trim().length <= RawSizeEnum.XSMALL)
        return toast.error("Description must be at least 64 characters long");

      const skills = i18nLabelsByIds(
        findManySkills.data?.nodes,
        form.getFieldValue("skillIds")
      );
      if (!skills.length) return toast.error("At least one skill is required");

      const name = form.getFieldValue("name");
      if (name) details.push({ key: "Name", value: [name] });

      const title = fieldGroup.title;
      if (title) details.push({ key: "Title", value: [title] });

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
          ProfileSchema,
          Field
        >
      );
    },
    [
      atsSummarize.mutateAsync,
      findManySkills.data?.nodes,
      form.getFieldValue,
      form.setFieldValue,
    ]
  );

  const handleTranslate = useCallback(
    async <Field extends DeepKeys<ProfileSchema>>(
      fieldGroup: ProfileSchema["i18n"][number],
      fieldName: Field,
      fieldValue: DeepValue<ProfileSchema, Field>
    ) => {
      const raw = fieldValue as string;

      if (raw.trim().length <= RawSizeEnum.XSMALL)
        return toast.error("Description must be at least 64 characters long");

      const translated = await translate.mutateAsync({
        raw,
        targetLanguage: fieldGroup.locale,
      });

      form.setFieldValue(
        fieldName,
        translated.translate.messages[0].message.content as DeepValue<
          ProfileSchema,
          Field
        >
      );
    },
    [translate.mutateAsync, form.setFieldValue]
  );

  const { Field, Subscribe } = form;

  return (
    <form
      className="flex flex-col gap-6"
      id={PROFILE_SETTINGS_FORM_ID}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <section className="rounded-box bg-base-200 p-4 sm:p-6">
        <h2 className="mb-4 font-semibold text-lg">Personal</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="name">
            {(field) => (
              <TextInput
                error={fieldError(field.state.meta)}
                label="Name"
                name={field.name}
                onChange={field.handleChange}
                placeholder={PLACEHOLDERS.profileName}
                value={field.state.value}
              />
            )}
          </Field>

          <Field name="nickname">
            {(field) => (
              <TextInput
                error={fieldError(field.state.meta)}
                label="Nickname"
                name={field.name}
                onChange={field.handleChange}
                placeholder={PLACEHOLDERS.nickname}
                value={field.state.value}
              />
            )}
          </Field>

          <Field name="birth">
            {(field) => (
              <TextInput
                error={fieldError(field.state.meta)}
                label="Birth date"
                name={field.name}
                onChange={field.handleChange}
                placeholder={PLACEHOLDERS.date}
                type="date"
                value={field.state.value}
              />
            )}
          </Field>

          <Field name="avatar">
            {(field) => (
              <TextInput
                error={fieldError(field.state.meta)}
                label="Avatar URL"
                name={field.name}
                onChange={field.handleChange}
                placeholder={PLACEHOLDERS.url}
                value={field.state.value}
              />
            )}
          </Field>
        </div>

        <div className="mt-4">
          <Field mode="array" name="i18n">
            {(arrayField) => (
              <FieldArray
                error={fieldError(arrayField.state.meta)}
                label="Translation"
                onAdd={() =>
                  arrayField.pushValue({
                    locale: "",
                    title: "",
                    description: "",
                  })
                }
                onRemove={(index) => arrayField.removeValue(index)}
                sublevel
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
                          placeholder={PLACEHOLDERS.profileTitle}
                          value={field.state.value}
                        />
                      )}
                    </Field>
                    <Field name={`i18n[${index}].description`}>
                      {(field) => (
                        <TextareaInput
                          disabled={
                            atsSummarize.isPending || translate.isPending
                          }
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
        </div>
      </section>

      <section className="rounded-box bg-base-200 p-4 sm:p-6">
        <h2 className="mb-4 font-semibold text-lg">Contact</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="email">
            {(field) => (
              <TextInput
                error={fieldError(field.state.meta)}
                label="Email"
                name={field.name}
                onChange={field.handleChange}
                placeholder={PLACEHOLDERS.email}
                type="email"
                value={field.state.value}
              />
            )}
          </Field>

          <Field name="phone">
            {(field) => (
              <TextInput
                error={fieldError(field.state.meta)}
                label="Phone"
                name={field.name}
                onChange={field.handleChange}
                placeholder={PLACEHOLDERS.phone}
                type="tel"
                value={field.state.value}
              />
            )}
          </Field>

          <Field name="address">
            {(field) => (
              <div className="md:col-span-2">
                <TextareaInput
                  error={fieldError(field.state.meta)}
                  label="Address"
                  name={field.name}
                  onChange={field.handleChange}
                  placeholder={PLACEHOLDERS.address}
                  value={field.state.value}
                />
              </div>
            )}
          </Field>
        </div>
        <div className="divider" />
        <h2 className="mb-4 font-semibold text-lg">Security</h2>
        <Field name="password">
          {(field) => (
            <PasswordInput
              error={fieldError(field.state.meta)}
              label="New password"
              name={field.name}
              onChange={field.handleChange}
              placeholder={PLACEHOLDERS.password}
              value={field.state.value}
            />
          )}
        </Field>
      </section>

      <section className="rounded-box bg-base-200 p-4 sm:p-6">
        <h2 className="mb-4 font-semibold text-lg">Main Skills</h2>
        <Field name="skillIds">
          {(field) => (
            <>
              <MultiSelectInput
                error={fieldError(field.state.meta)}
                label="Skills"
                onChange={field.handleChange}
                options={skillOptions}
                placeholder={PLACEHOLDERS.search}
                showSelected={false}
                value={field.state.value}
              />
              <DraggableList
                onChange={field.handleChange}
                options={skillOptions}
                value={field.state.value}
              />
            </>
          )}
        </Field>
      </section>

      <section className="rounded-box bg-base-200 p-4 sm:p-6">
        <h2 className="mb-4 font-semibold text-lg">Links</h2>
        <Field mode="array" name="urls">
          {(arrayField) => (
            <FieldArray
              error={fieldError(arrayField.state.meta)}
              label="Link"
              onAdd={() => arrayField.pushValue({ title: "", value: "" })}
              onRemove={(index) => arrayField.removeValue(index)}
              sublevel
              values={arrayField.state.value}
            >
              {(index) => (
                <>
                  <Field name={`urls[${index}].title`}>
                    {(field) => (
                      <TextInput
                        error={fieldError(field.state.meta)}
                        name={field.name}
                        onChange={field.handleChange}
                        placeholder={PLACEHOLDERS.linkTitle}
                        value={field.state.value}
                      />
                    )}
                  </Field>
                  <Field name={`urls[${index}].value`}>
                    {(field) => (
                      <TextInput
                        error={fieldError(field.state.meta)}
                        name={field.name}
                        onChange={field.handleChange}
                        placeholder={PLACEHOLDERS.url}
                        value={field.state.value}
                      />
                    )}
                  </Field>
                </>
              )}
            </FieldArray>
          )}
        </Field>
      </section>

      <div className="form-footer mt-0">
        <button
          className="btn btn-ghost btn-block"
          disabled={isDisabled || isLoading}
          onClick={() => form.reset()}
          type="button"
        >
          Reset
        </button>
        <Subscribe>
          {({ canSubmit, isSubmitting, isTouched }) => (
            <button
              className="btn btn-soft btn-primary flex-1 lg:hidden"
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
              Save changes
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
