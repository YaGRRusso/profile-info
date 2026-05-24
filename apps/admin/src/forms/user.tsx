import { useForm } from "@tanstack/react-form";
import z from "zod";
import { CommonFormProps } from "./common";

const userSchema = z.object({
  username: z.string().min(1, "required"),
  password: z.string().min(1, "required"),
});

export type UserSchema = z.infer<typeof userSchema>;

export interface UserFormProps extends CommonFormProps<UserSchema> {}

export function UserForm({
  onSubmit,
  onCancel,
  defaultValues,
  customValues,
  isDisabled,
  isLoading,
}: UserFormProps) {
  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
      ...defaultValues,
    },
    onSubmit: ({ value }) => onSubmit?.({ ...value, ...customValues }),
    validators: { onChange: userSchema },
  });

  return (
    <form
      className="flex w-full max-w-md flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field
        children={(field) => (
          <input
            className="input w-full"
            id={field.name}
            name={field.name}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder="Username"
            type="text"
            value={field.state.value}
          />
        )}
        name="username"
      />
      <form.Field
        children={(field) => (
          <input
            className="input w-full"
            id={field.name}
            name={field.name}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder="Password"
            type="password"
            value={field.state.value}
          />
        )}
        name="password"
      />
      <div className="flex items-center gap-2">
        <button
          className="btn btn-soft flex-1"
          onClick={() => onCancel?.()}
          type="reset"
        >
          Cancel
        </button>
        <form.Subscribe
          children={({ canSubmit, isSubmitting }) => (
            <button
              className="btn btn-soft flex-1"
              disabled={!canSubmit || isSubmitting || isDisabled || isLoading}
              type="submit"
            >
              Submit
            </button>
          )}
        />
      </div>
    </form>
  );
}
