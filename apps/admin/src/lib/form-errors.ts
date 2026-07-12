export const FormError = {
  requiredField: "requiredField",
  invalidField: "invalidField",
  uniqueField: "uniqueField",
  existingField: "existingField",
  minLength: "minLength",
  maxLength: "maxLength",
  requiredGroup: "requiredGroup",
} as const;

export type FormErrorKey = (typeof FormError)[keyof typeof FormError];
