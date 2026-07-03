import { useQueryClient } from "@tanstack/react-query";
import { useSignIn } from "@/hooks/mutations/auth";
import { useAuthStore } from "@/stores/auth";

const DEV_PERSONAS = [
  { label: "Empty", email: "empty@profile.info" },
  { label: "Lite", email: "lite@profile.info" },
  { label: "João", email: "joao@profile.info" },
  { label: "Maria", email: "maria@profile.info" },
  { label: "Full", email: "full@profile.info" },
  { label: "Admin", email: "admin@profile.info" },
] as const;

const DEV_PASSWORD = "123123";

export function DevQuickLogin() {
  const { setToken } = useAuthStore();
  const queryClient = useQueryClient();
  const signIn = useSignIn();

  if (!import.meta.env.DEV) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {DEV_PERSONAS.map((persona) => (
        <button
          className="btn btn-xs btn-soft"
          disabled={signIn.isPending}
          key={persona.email}
          onClick={() =>
            signIn.mutate(
              { email: persona.email, password: DEV_PASSWORD },
              {
                onSuccess: (data) => {
                  queryClient.clear();
                  if (data?.signIn) setToken(data.signIn);
                },
              }
            )
          }
          type="button"
        >
          {persona.label}
        </button>
      ))}
    </div>
  );
}
