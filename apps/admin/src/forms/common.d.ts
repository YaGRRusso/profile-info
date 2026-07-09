/** biome-ignore-all lint/suspicious/noExplicitAny: common type */
export interface CommonFormValuesProps<
  Default = Record<string, any>,
  Custom = Record<string, any>,
> {
  customValues?: Partial<Custom>;
  defaultValues?: Partial<Default>;
  isDisabled?: boolean;
  isLoading?: boolean;
  state?:
    | "CREATING"
    | "MULTI_CREATING"
    | "READING"
    | "MULTI_READING"
    | "UPDATING"
    | "MULTI_UPDATING"
    | "DELETING"
    | "MULTI_DELETING"
    | "DISABLING"
    | "MULTI_DISABLING"
    | "ENABLING"
    | "MULTI_ENABLING";
}

export interface CommonFormProps<
  Default = Record<string, any>,
  Custom = Record<string, any>,
> extends CommonFormValuesProps<Default, Custom> {
  onCancel?: () => void;
  onSubmit?: (data: Default & Partial<Custom>) => void;
}
