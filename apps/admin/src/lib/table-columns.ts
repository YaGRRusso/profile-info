import { VisibilityState } from "@tanstack/react-table";
import { UserRole } from "@/generated/graphql/graphql";

export type RestrictedColumns = Partial<Record<UserRole, string[]>>;

export function canSeeColumn(
  restricted: RestrictedColumns,
  columnId: string,
  role?: string | null
) {
  for (const cols of Object.values(restricted)) {
    if (cols?.includes(columnId)) {
      return (
        role != null &&
        restricted[role as UserRole]?.includes(columnId) === true
      );
    }
  }
  return true;
}

export function getRestrictedVisibility(
  visibility: VisibilityState,
  restricted: RestrictedColumns,
  role?: string | null
) {
  const hidden = Object.fromEntries(
    [...new Set(Object.values(restricted).flat())]
      .filter((id) => !canSeeColumn(restricted, id, role))
      .map((id) => [id, false])
  );
  return { ...visibility, ...hidden };
}
