/** biome-ignore-all lint/suspicious/noExplicitAny: common type */
export interface CommonFormValuesProps<
  Default = Record<string, any>,
  Custom = Record<string, any>,
> {
  customValues?: Partial<Custom>;
  defaultValues?: Partial<Default>;
  isDisabled?: boolean;
  isLoading?: boolean;
  state?: "CREATING" | "READING" | "UPDATING" | "DELETING";
}

export interface CommonFormProps<
  Default = Record<string, any>,
  Custom = Record<string, any>,
> extends CommonFormValuesProps<Default, Custom> {
  onCancel?: () => void;
  onSubmit?: (data: Default & Partial<Custom>) => void;
}
