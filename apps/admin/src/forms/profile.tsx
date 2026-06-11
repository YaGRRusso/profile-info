import { useForm } from "@tanstack/react-form";
import z from "zod";
import { FieldArray } from "@/components/inputs/field-array";
import { PasswordInput } from "@/components/inputs/password";
import { TextInput } from "@/components/inputs/text";
import { TextareaInput } from "@/components/inputs/textarea";
import type { GetMeQuery, UpdateMeInput } from "@/generated/graphql/graphql";
import { toDateInput, toIsoDate } from "@/lib/date";
import { fieldError } from "@/lib/field-error";
import { CommonFormProps } from "./common";

const urlSchema = z.object({
  title: z.string().min(1, "required field"),
  value: z.url("invalid url"),
});

const profileSchema = z.object({
  name: z.string().min(1, "required field"),
  nickname: z.string().min(1, "required field"),
  email: z.email("invalid email"),
  title: z.string(),
  phone: z.string(),
  avatar: z.union([z.literal(""), z.url("invalid url")]),
  birth: z.union([z.literal(""), z.string("invalid date")]),
  address: z.string(),
  urls: z.array(urlSchema),
  password: z.union([
    z.literal(""),
    z.string().min(8, "must be at least 8 characters"),
  ]),
});

export type ProfileSchema = z.infer<typeof profileSchema>;

export interface ProfileFormProps extends CommonFormProps<ProfileSchema> {}

type GetMeUser = GetMeQuery["getMe"];

export function profileToForm(user: GetMeUser): Partial<ProfileSchema> {
  return {
    name: user.name,
    nickname: user.nickname,
    email: user.email,
    title: user.title ?? "",
    phone: user.phone ?? "",
    avatar: user.avatar ?? "",
    birth: toDateInput(user.birth),
    address: user.address ?? "",
    urls: (user.urls ?? []).map((url) => ({
      title: url.title,
      value: url.value,
    })),
    password: "",
  };
}

export function profileToInput(data: ProfileSchema): UpdateMeInput {
  return {
    name: data.name,
    nickname: data.nickname,
    email: data.email,
    title: data.title || undefined,
    phone: data.phone || undefined,
    avatar: data.avatar || undefined,
    birth: toIsoDate(data.birth),
    address: data.address || undefined,
    urls: data.urls.length ? data.urls : undefined,
    password: data.password || undefined,
  };
}

export function ProfileForm({
  onSubmit,
  defaultValues,
  isDisabled,
  isLoading,
}: ProfileFormProps) {
  const form = useForm({
    defaultValues: {
      name: "",
      nickname: "",
      email: "",
      title: "",
      phone: "",
      avatar: "",
      birth: "",
      address: "",
      urls: [] as ProfileSchema["urls"],
      password: "",
      ...defaultValues,
    },
    onSubmit: ({ value }) => onSubmit?.(value),
    validators: { onChange: profileSchema },
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
      <div className="divider">Personal</div>

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

      <Field name="nickname">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label="Nickname"
            name={field.name}
            onChange={field.handleChange}
            placeholder="Nickname"
            value={field.state.value}
          />
        )}
      </Field>

      <Field name="title">
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

      <Field name="avatar">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label="Avatar URL"
            name={field.name}
            onChange={field.handleChange}
            placeholder="https://example.com/avatar.png"
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
            placeholder="YYYY-MM-DD"
            type="date"
            value={field.state.value}
          />
        )}
      </Field>

      <div className="divider">Contact</div>

      <Field name="email">
        {(field) => (
          <TextInput
            error={fieldError(field.state.meta)}
            label="Email"
            name={field.name}
            onChange={field.handleChange}
            placeholder="Email"
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
            placeholder="Phone"
            type="tel"
            value={field.state.value}
          />
        )}
      </Field>

      <Field name="address">
        {(field) => (
          <TextareaInput
            error={fieldError(field.state.meta)}
            label="Address"
            name={field.name}
            onChange={field.handleChange}
            placeholder="Address"
            value={field.state.value}
          />
        )}
      </Field>

      <div className="divider">Security</div>

      <Field name="password">
        {(field) => (
          <PasswordInput
            error={fieldError(field.state.meta)}
            label="New password"
            name={field.name}
            onChange={field.handleChange}
            placeholder="Leave blank to keep current password"
            value={field.state.value}
          />
        )}
      </Field>

      <div className="divider">Links</div>

      <Field mode="array" name="urls">
        {(arrayField) => (
          <FieldArray
            error={fieldError(arrayField.state.meta)}
            label="Link"
            onAdd={() => arrayField.pushValue({ title: "", value: "" })}
            onRemove={(index) => arrayField.removeValue(index)}
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
                      placeholder="Title"
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
                      placeholder="URL"
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
        <Subscribe>
          {({ canSubmit, isSubmitting, isTouched }) => (
            <button
              className="btn btn-soft btn-block btn-primary"
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
