import { BadRequestException } from "@nestjs/common";
import { uniq } from "lodash";
import { i18nKey } from "@/core/i18n/i18n";

export function assertReferencesExist(
  requestedIds: string[],
  foundIds: Iterable<string>
): void {
  if (requestedIds.length === 0) return;

  const foundSet = new Set([...foundIds].map(String));
  const missing = requestedIds.some((id) => !foundSet.has(id));

  if (missing)
    throw new BadRequestException(i18nKey("common.REFERENCES_NOT_FOUND"));
}

export async function assertReferencesResolved(
  requestedIds: string[] | undefined,
  findById: (ids: string[]) => Promise<Array<{ id: string }>>
): Promise<void> {
  if (!requestedIds?.length) return;

  const uniqueIds = uniq(requestedIds);
  const found = await findById(uniqueIds);
  assertReferencesExist(
    uniqueIds,
    found.map((item) => item.id)
  );
}
