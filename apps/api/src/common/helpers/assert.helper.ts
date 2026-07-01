import { BadRequestException } from "@nestjs/common";

export const REFERENCES_NOT_FOUND = "Referenced resource not found";

export function assertReferencesExist(
  requestedIds: string[],
  foundIds: Iterable<string>
): void {
  if (requestedIds.length === 0) return;

  const foundSet = new Set([...foundIds].map(String));
  const missing = requestedIds.some((id) => !foundSet.has(id));

  if (missing) throw new BadRequestException(REFERENCES_NOT_FOUND);
}

export async function assertReferencesResolved(
  requestedIds: string[] | undefined,
  findById: (ids: string[]) => Promise<Array<{ id: string }>>
): Promise<void> {
  if (!requestedIds?.length) return;

  const uniqueIds = [...new Set(requestedIds)];
  const found = await findById(uniqueIds);
  assertReferencesExist(
    uniqueIds,
    found.map((item) => item.id)
  );
}
