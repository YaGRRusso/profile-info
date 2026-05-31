import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import z from "zod";
import { CheckboxInput } from "@/components/inputs/checkbox";
import { RangeInput } from "@/components/inputs/range";
import { SelectInput } from "@/components/inputs/select";
import {
  EducationLevel,
  EducationStatus,
  type UpdateEducationInput,
} from "@/graphql/graphql";
import { fieldError } from "@/lib/field-error";
import { CommonFormProps } from "./common";

const educationMultiSchema = z.object({
  level: z.enum(EducationLevel),
  status: z.enum(EducationStatus),
  relevance: z.number().min(1, "must be a positive number"),
});

export type EducationMultiSchema = z.infer<typeof educationMultiSchema>;

export interface EducationMultiFormProps
  extends CommonFormProps<UpdateEducationInput> {}

const LEVEL_OPTIONS = Object.values(EducationLevel).map((level) => ({
  label: level,
  value: level,
}));

const STATUS_OPTIONS = Object.values(EducationStatus).map((status) => ({
  label: status,
  value: status,
}));

export function EducationMultiForm({
  onSubmit,
  onCancel,
  isDisabled,
  isLoading,
}: EducationMultiFormProps) {
  const [changeLevel, setChangeLevel] = useState(false);
  const [changeStatus, setChangeStatus] = useState(false);
  const [changeRelevance, setChangeRelevance] = useState(false);

  const form = useForm({
    defaultValues: {
      level: EducationLevel.Bachelor,
      status: EducationStatus.Complete,
      relevance: 1,
    },
    onSubmit: ({ value }) => {
      const updateEducationInput: UpdateEducationInput = {};
      if (changeLevel) updateEducationInput.level = value.level;
      if (changeStatus) updateEducationInput.status = value.status;
      if (changeRelevance) updateEducationInput.relevance = value.relevance;
      onSubmit?.(updateEducationInput);
    },
    validators: { onChange: educationMultiSchema },
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
        checked={changeLevel}
        label="Change Level"
        onChange={setChangeLevel}
      />

      <Field name="level">
        {(field) => (
          <SelectInput
            disabled={!changeLevel}
            error={fieldError(field.state.meta)}
            name={field.name}
            onChange={(value) => field.handleChange(value as EducationLevel)}
            options={LEVEL_OPTIONS}
            placeholder="Level"
            value={field.state.value}
          />
        )}
      </Field>

      <div className="divider" />

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
            name={field.name}
            onChange={(value) => field.handleChange(value as EducationStatus)}
            options={STATUS_OPTIONS}
            placeholder="Status"
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
                !(changeLevel || changeStatus || changeRelevance) ||
                isSubmitting ||
                isDisabled ||
                isLoading
              }
              type="submit"
            >
              {(isSubmitting || isLoading) && (
                <span className="loading loading-spinner loading-xs" />
              )}
              Update Educations
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
