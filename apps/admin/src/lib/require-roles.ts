import { notFound } from "@tanstack/react-router";
import { UserRole } from "@/generated/graphql/graphql";
import { waitForAuthHydration } from "@/hooks/custom/use-auth-hydrated";
import { useAuthStore } from "@/stores/auth";

export function requireRoles(...allowedRoles: UserRole[]) {
  return async () => {
    await waitForAuthHydration();
    const role = useAuthStore.getState().user?.role;
    if (role == null || !allowedRoles.includes(role as UserRole)) {
      throw notFound();
    }
  };
}
