import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import z from "zod";
import { CheckboxInput } from "@/components/inputs/checkbox";
import { RangeInput } from "@/components/inputs/range";
import type { UpdateProjectInput } from "@/graphql/graphql";
import { fieldError } from "@/lib/field-error";
import { CommonFormProps } from "./common";

const projectMultiSchema = z.object({
  relevance: z.number().min(1, "must be a positive number"),
});

export type ProjectMultiSchema = z.infer<typeof projectMultiSchema>;

export interface ProjectMultiFormProps
  extends CommonFormProps<UpdateProjectInput> {}

export function ProjectMultiForm({
  onSubmit,
  onCancel,
  isDisabled,
  isLoading,
}: ProjectMultiFormProps) {
  const [changeRelevance, setChangeRelevance] = useState(false);

  const form = useForm({
    defaultValues: {
      relevance: 1,
    },
    onSubmit: ({ value }) => {
      const updateProjectInput: UpdateProjectInput = {};
      if (changeRelevance) updateProjectInput.relevance = value.relevance;
      onSubmit?.(updateProjectInput);
    },
    validators: { onChange: projectMultiSchema },
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
      <CheckboxInput
        checked={changeRelevance}
        label="Change Relevance"
        onChange={setChangeRelevance}
      />

      <Field name="relevance">
        {(field) => (
          <RangeInput
            className="range-xs"
            disabled={!changeRelevance}
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
          {({ canSubmit, isSubmitting }) => (
            <button
              className="btn btn-soft btn-primary flex-1"
              disabled={
                !canSubmit ||
                !changeRelevance ||
                isSubmitting ||
                isDisabled ||
                isLoading
              }
              type="submit"
            >
              {(isSubmitting || isLoading) && (
                <span className="loading loading-spinner loading-xs" />
              )}
              Update Projects
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
