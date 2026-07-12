export const FormError = {
  requiredField: "requiredField",
  requiredGroup: "requiredGroup",
  invalidField: "invalidField",
  invalidGroup: "invalidGroup",
  invalidFormat: "invalidFormat",
  invalidRange: "invalidRange",
  uniqueField: "uniqueField",
  existingField: "existingField",
  minLength: "minLength",
  maxLength: "maxLength",
  minCount: "minCount",
  maxCount: "maxCount",
  minValue: "minValue",
  maxValue: "maxValue",
} as const;

export type FormErrorKey = (typeof FormError)[keyof typeof FormError];
