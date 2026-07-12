import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import z from "zod";
import { CheckboxInput } from "@/components/inputs/checkbox";
import { RangeInput } from "@/components/inputs/range";
import { SelectInput } from "@/components/inputs/select";
import {
  EducationLevel,
  EducationStatus,
  type UpdateEducationInput,
} from "@/generated/graphql/graphql";
import { fieldError } from "@/lib/field-error";
import { FormError } from "@/lib/form-errors";
import { CommonFormProps } from "./common";

const educationMultiSchema = z.object({
  level: z.enum(EducationLevel),
  status: z.enum(EducationStatus),
  relevance: z.number().min(1, FormError.requiredField),
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
  const { t: tForm } = useTranslation("forms");
  const { t: tAction } = useTranslation("actions");
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
        label={tForm("batch.changeLevel.label")}
        onChange={setChangeLevel}
        tooltip={tForm("batch.changeLevel.tooltip")}
      />

      <Field name="level">
        {(field) => (
          <SelectInput
            disabled={!changeLevel}
            error={fieldError(field.state.meta)}
            label={tForm("fields.level.label")}
            name={field.name}
            onChange={(value) => field.handleChange(value as EducationLevel)}
            options={LEVEL_OPTIONS}
            placeholder={tForm("fields.level.placeholder")}
            tooltip={tForm("fields.level.tooltip")}
            value={field.state.value}
          />
        )}
      </Field>

      <div className="divider" />

      <CheckboxInput
        checked={changeStatus}
        label={tForm("batch.changeStatus.label")}
        onChange={setChangeStatus}
        tooltip={tForm("batch.changeStatus.tooltip")}
      />

      <Field name="status">
        {(field) => (
          <SelectInput
            disabled={!changeStatus}
            error={fieldError(field.state.meta)}
            label={tForm("fields.status.label")}
            name={field.name}
            onChange={(value) => field.handleChange(value as EducationStatus)}
            options={STATUS_OPTIONS}
            placeholder={tForm("fields.status.placeholder")}
            tooltip={tForm("fields.status.tooltip")}
            value={field.state.value}
          />
        )}
      </Field>

      <div className="divider" />

      <CheckboxInput
        checked={changeRelevance}
        label={tForm("batch.changeRelevance.label")}
        onChange={setChangeRelevance}
        tooltip={tForm("batch.changeRelevance.tooltip")}
      />

      <Field name="relevance">
        {(field) => (
          <RangeInput
            className="range-xs"
            disabled={!changeRelevance}
            error={fieldError(field.state.meta)}
            label={tForm("fields.relevance.label")}
            max={5}
            min={1}
            name={field.name}
            onChange={field.handleChange}
            ruler
            step={1}
            tooltip={tForm("fields.relevance.tooltip")}
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
            {tAction("cancel")}
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
              {tForm("submit.updateEducations")}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
