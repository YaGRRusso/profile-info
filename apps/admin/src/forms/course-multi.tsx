import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import z from "zod";
import { CheckboxInput } from "@/components/inputs/checkbox";
import { RangeInput } from "@/components/inputs/range";
import { SelectInput } from "@/components/inputs/select";
import { PLACEHOLDERS } from "@/consts/placeholders";
import {
  CourseStatus,
  type UpdateCourseInput,
} from "@/generated/graphql/graphql";
import { fieldError } from "@/lib/field-error";
import { CommonFormProps } from "./common";

const courseMultiSchema = z.object({
  status: z.enum(CourseStatus),
  relevance: z.number().min(1, "must be a positive number"),
});

export type CourseMultiSchema = z.infer<typeof courseMultiSchema>;

export interface CourseMultiFormProps
  extends CommonFormProps<UpdateCourseInput> {}

const STATUS_OPTIONS = Object.values(CourseStatus).map((status) => ({
  label: status,
  value: status,
}));

export function CourseMultiForm({
  onSubmit,
  onCancel,
  isDisabled,
  isLoading,
}: CourseMultiFormProps) {
  const [changeStatus, setChangeStatus] = useState(false);
  const [changeRelevance, setChangeRelevance] = useState(false);

  const form = useForm({
    defaultValues: {
      status: CourseStatus.Complete,
      relevance: 1,
    },
    onSubmit: ({ value }) => {
      const updateCourseInput: UpdateCourseInput = {};
      if (changeStatus) updateCourseInput.status = value.status;
      if (changeRelevance) updateCourseInput.relevance = value.relevance;
      onSubmit?.(updateCourseInput);
    },
    validators: { onChange: courseMultiSchema },
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
        checked={changeStatus}
        label="Change Status"
        onChange={setChangeStatus}
      />

      <Field name="status">
        {(field) => (
          <SelectInput
            disabled={!changeStatus}
            error={fieldError(field.state.meta)}
            label="Status"
            name={field.name}
            onChange={(value) => field.handleChange(value as CourseStatus)}
            options={STATUS_OPTIONS}
            placeholder={PLACEHOLDERS.chooseOne}
            value={field.state.value}
          />
        )}
      </Field>

      <div className="divider" />

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
                !(changeStatus || changeRelevance) ||
                isSubmitting ||
                isDisabled ||
                isLoading
              }
              type="submit"
            >
              {(isSubmitting || isLoading) && (
                <span className="loading loading-spinner loading-xs" />
              )}
              Update Courses
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
