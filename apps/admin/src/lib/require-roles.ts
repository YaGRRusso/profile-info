import { notFound } from "@tanstack/react-router";
import { isNil } from "lodash";
import { UserRole } from "@/generated/graphql/graphql";
import { useAuthStore, waitForAuthHydration } from "@/stores/auth";

export function requireRoles(...allowedRoles: UserRole[]) {
  return async () => {
    await waitForAuthHydration();
    const role = useAuthStore.getState().user?.role;
    if (isNil(role) || !allowedRoles.includes(role)) {
      throw notFound();
    }
  };
}
