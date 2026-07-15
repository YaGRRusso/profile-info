import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import z from "zod";
import { CheckboxInput } from "@/components/inputs/checkbox";
import { FormDivider } from "@/components/inputs/divider";
import { RangeInput } from "@/components/inputs/range";
import { SelectInput } from "@/components/inputs/select";
import {
  CourseStatus,
  type UpdateCourseInput,
} from "@/generated/graphql/graphql";
import { fieldError } from "@/lib/field-error";
import { FormError } from "@/lib/form-errors";
import { CommonFormProps } from "./common";

const courseMultiSchema = z.object({
  relevance: z.number().min(1, FormError.minValue),
  status: z.enum(CourseStatus),
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
  const { t: tForm } = useTranslation("forms");
  const { t: tAction } = useTranslation("actions");
  const [changeStatus, setChangeStatus] = useState(false);
  const [changeRelevance, setChangeRelevance] = useState(false);

  const form = useForm({
    defaultValues: {
      relevance: 1,
      status: CourseStatus.Complete,
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
            onChange={field.handleChange}
            options={STATUS_OPTIONS}
            placeholder={tForm("fields.status.placeholder")}
            tooltip={tForm("fields.status.tooltip")}
            value={field.state.value}
          />
        )}
      </Field>

      <FormDivider />

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
              {tForm("submit.updateCourses")}
            </button>
          )}
        </Subscribe>
      </div>
    </form>
  );
}
