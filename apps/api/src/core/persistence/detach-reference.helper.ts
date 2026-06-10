import type { Model } from "mongoose";

/**
 * Removes a reference ID from an array field across all documents that contain it.
 * Domain-agnostic: works for any entity removing any reference from any array field.
 *
 * Usage:
 *   await detachReference(this.courseModel, "skills", skillId);
 *   await detachReference(this.projectModel, "skills", skillId);
 */
export async function detachReference<T>(
  model: Model<T>,
  field: string,
  referenceId: string
): Promise<void> {
  await model
    .updateMany(
      { [field]: referenceId } as any,
      { $pull: { [field]: referenceId } } as any
    )
    .exec();
}

/**
 * Removes a reference ID from a nested array field (e.g. "roles.skills").
 * Uses arrayFilters for targeted updates within nested arrays.
 *
 * Usage:
 *   await detachNestedReference(
 *     this.experienceModel,
 *     "roles.$[elem].skills",
 *     { "elem.skills": skillId },
 *     skillId
 *   );
 */
export async function detachNestedReference<T>(
  model: Model<T>,
  pullPath: string,
  arrayFilter: Record<string, unknown>,
  referenceId: string
): Promise<void> {
  const filterField = pullPath.split(".$[")[0];

  await model
    .updateMany(
      { [filterField]: referenceId } as any,
      { $pull: { [pullPath]: referenceId } } as any,
      { arrayFilters: [arrayFilter] }
    )
    .exec();
}
