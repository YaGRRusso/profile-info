import { useForm } from "@tanstack/react-form";
import z from "zod";
import { RangeInput } from "@/components/inputs/range";
import { SelectInput } from "@/components/inputs/select";
import { TextInput } from "@/components/inputs/text";
import { SkillCategory } from "@/graphql/graphql";
import { CommonFormProps } from "./common";

const skillSchema = z.object({
  name: z.string().min(1, "required field"),
  slug: z.string().min(1, "required field"),
  category: z.enum(SkillCategory, "required field"),
  relevance: z.number().min(1, "must be a positive number"),
});

export type SkillSchema = z.infer<typeof skillSchema>;

export interface SkillFormProps extends CommonFormProps<SkillSchema> {}

const CATEGORY_OPTIONS = Object.values(SkillCategory).map((category) => ({
  label: category,
  value: category,
}));

export function SkillForm({
  onSubmit,
  onCancel,
  defaultValues,
  customValues,
  isDisabled,
  isLoading,
  state,
}: SkillFormProps) {
  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
      category: SkillCategory.Language,
      relevance: 1,
      ...defaultValues,
    },
    onSubmit: ({ value }) => onSubmit?.({ ...value, ...customValues }),
    validators: { onChange: skillSchema },
  });

  const { Field, Subscribe } = form;

  return (
    <form
      className="flex w-full flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Field name="name">
        {(field) => <TextInput field={field} placeholder="Name" />}
      </Field>
      <Field name="slug">
        {(field) => <TextInput field={field} placeholder="Slug" />}
      </Field>
      <Field name="category">
        {(field) => (
          <SelectInput
            field={field}
            options={CATEGORY_OPTIONS}
            placeholder="Category"
          />
        )}
      </Field>
      <Field name="relevance">
        {(field) => (
          <RangeInput
            field={field}
            max={5}
            min={1}
            placeholder="Relevance"
            ruler
            step={1}
          />
        )}
      </Field>
      <div className="flex items-center gap-2">
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
              {state === "UPDATING" ? "Update Skill" : "Create Skill"}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
