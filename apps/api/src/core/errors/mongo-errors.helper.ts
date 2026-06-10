import { ConflictException, NotFoundException } from "@nestjs/common";

interface MongoServerError {
  code?: number;
  keyValue?: Record<string, unknown>;
}

/**
 * Checks if an error is a MongoDB duplicate key violation (E11000).
 * Use in a catch block to provide a friendly error message.
 */
export function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as MongoServerError).code === 11_000
  );
}

/**
 * Throws ConflictException if the given error is a duplicate key violation.
 * Re-throws the original error otherwise — nothing is swallowed.
 */
export function throwIfDuplicateKey(error: unknown, field?: string): never {
  if (isDuplicateKeyError(error)) {
    const resolvedField =
      field ?? extractDuplicateField(error as MongoServerError);
    throw new ConflictException(
      `A record with this ${resolvedField} already exists.`
    );
  }
  throw error;
}

/**
 * Asserts that referenced documents exist before creating a relationship.
 * Throws NotFoundException if the found count doesn't match the expected count.
 */
export async function assertReferencesExist(
  countFn: () => Promise<number>,
  expectedCount: number,
  entityName: string
): Promise<void> {
  const found = await countFn();
  if (found < expectedCount) {
    const missing = expectedCount - found;
    throw new NotFoundException(
      `${missing} referenced ${entityName}(s) not found.`
    );
  }
}

function extractDuplicateField(error: MongoServerError): string {
  const keys = Object.keys(error.keyValue ?? {});
  return keys[0] ?? "value";
}
