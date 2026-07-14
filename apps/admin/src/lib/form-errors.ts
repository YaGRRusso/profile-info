export const FormError = {
  existingField: "existingField",
  invalidField: "invalidField",
  invalidFormat: "invalidFormat",
  invalidGroup: "invalidGroup",
  invalidRange: "invalidRange",
  maxCount: "maxCount",
  maxLength: "maxLength",
  maxValue: "maxValue",
  minCount: "minCount",
  minLength: "minLength",
  minValue: "minValue",
  requiredField: "requiredField",
  requiredGroup: "requiredGroup",
  uniqueField: "uniqueField",
} as const;

export type FormErrorKey = (typeof FormError)[keyof typeof FormError];
