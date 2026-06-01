import { useForm } from "@tanstack/react-form";
import z from "zod";
import { FieldArray } from "@/components/inputs/field-array";
import { RangeInput } from "@/components/inputs/range";
import { TextInput } from "@/components/inputs/text";
import type { CreateProjectInput } from "@/graphql/graphql";
import type { ProjectRow } from "@/hooks/queries/projects";
import { fieldError } from "@/lib/field-error";
import { CommonFormProps } from "./common";

const projectSchema = z.object({
  slug: z.string().min(1, "required field"),
  relevance: z.number().min(1, "must be a positive number"),
  images: z.array(z.url()),
  urls: z.array(
    z.object({
      title: z.string().min(1, "required field"),
      value: z.url(),
    })
  ),
  i18n: z
    .array(
      z.object({
        locale: z.string().min(1, "required field"),
        title: z.string().min(1, "required field"),
        description: z.string().min(1, "required field"),
      })
    )
    .min(1, "required group"),
});

export type ProjectSchema = z.infer<typeof projectSchema>;

export interface ProjectFormProps extends CommonFormProps<ProjectSchema> {}

export function projectToInput(data: ProjectSchema): CreateProjectInput {
  return {
    slug: data.slug,
    relevance: data.relevance,
    images: data.images.length ? data.images : undefined,
    urls: data.urls.length ? data.urls : undefined,
    i18n: data.i18n.map((translation) => ({
      locale: translation.locale,
      messages: {
        title: translation.title,
        description: translation.description,
      },
    })),
  };
}

export function projectToForm(project: ProjectRow): Partial<ProjectSchema> {
  return {
    slug: project.slug,
    relevance: project.relevance,
    images: project.images ?? [],
    urls: (project.urls ?? []).map((url) => ({
      title: url.title,
      value: url.value,
    })),
    i18n: project.i18n.map((translation) => ({
      locale: translation.locale,
      title: translation.messages.title,
      description: translation.messages.description,
    })),
  };
}

export function ProjectForm({
  onSubmit,
  onCancel,
  defaultValues,
  isDisabled,
  isLoading,
  state,
}: ProjectFormProps) {
  const form = useForm({
    defaultValues: {
      slug: "",
      relevance: 1,
      images: [] as string[],
      urls: [] as { title: string; value: string }[],
      i18n: [{ locale: "", title: "", description: "" }],
      ...defaultValues,
    },
    onSubmit: ({ value }) => onSubmit?.(value),
    validators: { onChange: projectSchema },
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

      <div className="divider">Images</div>

      <Field mode="array" name="images">
        {(arrayField) => (
          <FieldArray
            error={fieldError(arrayField.state.meta)}
            label="Image"
            onAdd={() => arrayField.pushValue("")}
            onRemove={(index) => arrayField.removeValue(index)}
            values={arrayField.state.value}
          >
            {(index) => (
              <Field name={`images[${index}]`}>
                {(field) => (
                  <TextInput
                    error={fieldError(field.state.meta)}
                    name={field.name}
                    onChange={field.handleChange}
                    placeholder="Image URL"
                    value={field.state.value}
                  />
                )}
              </Field>
            )}
          </FieldArray>
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
                      name={field.name}
                      onChange={field.handleChange}
                      placeholder="Locale (e.g. en, pt-BR)"
                      value={field.state.value}
                    />
                  )}
                </Field>
                <Field name={`i18n[${index}].title`}>
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
                <Field name={`i18n[${index}].description`}>
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
              {state === "UPDATING" ? "Update Project" : "Create Project"}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
