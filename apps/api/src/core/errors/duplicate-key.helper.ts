import { ConflictException, NotFoundException } from "@nestjs/common";

interface MongoServerError {
  code?: number;
  keyValue?: Record<string, unknown>;
}

/**
 * Asserts that a Mongoose write operation did not violate a unique index.
 * Catches MongoDB E11000 and throws a NestJS ConflictException with a clear message.
 *
 * Does NOT swallow other errors — they propagate normally.
 */
export async function assertUniqueConstraint<T>(
  operation: () => Promise<T>,
  fieldHint?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error: unknown) {
    if (isDuplicateKeyError(error)) {
      const field = fieldHint ?? extractDuplicateField(error);
      throw new ConflictException(
        `A record with this ${field} already exists.`
      );
    }
    throw error;
  }
}

/**
 * Asserts that referenced documents exist before creating a relationship.
 * Throws NotFoundException if the count of found documents doesn't match the input.
 *
 * Useful when a module receives IDs from another domain (e.g. skill IDs on a project).
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

function isDuplicateKeyError(error: unknown): error is MongoServerError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as MongoServerError).code === 11_000
  );
}

function extractDuplicateField(error: MongoServerError): string {
  const keys = Object.keys(error.keyValue ?? {});
  return keys[0] ?? "value";
}
