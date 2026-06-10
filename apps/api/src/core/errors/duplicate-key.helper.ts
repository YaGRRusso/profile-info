import { ConflictException } from "@nestjs/common";

interface MongoServerError {
  code?: number;
  keyValue?: Record<string, unknown>;
}

/**
 * Wraps a Mongoose operation and converts MongoDB duplicate key errors (E11000)
 * into a NestJS ConflictException with a human-readable message.
 *
 * Usage:
 *   return catchDuplicateKey(
 *     () => this.model.create(data),
 *     "slug"
 *   );
 */
export async function catchDuplicateKey<T>(
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
