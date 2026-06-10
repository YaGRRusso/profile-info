import type { Model, QueryFilter, UpdateQuery } from "mongoose";

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
  field: keyof T & string,
  referenceId: string
): Promise<void> {
  await model
    .updateMany(
      { [field]: referenceId } as QueryFilter<T>,
      { $pull: { [field]: referenceId } } as UpdateQuery<T>
    )
    .exec();
}

/**
 * Removes a reference ID from a nested array field (e.g. "roles.skills").
 * Uses arrayFilters for targeted updates within nested arrays.
 *
 * Usage:
 *   await detachNestedReference(this.experienceModel, {
 *     filter: "roles.skills",
 *     pullPath: "roles.$[elem].skills",
 *     arrayFilter: { "elem.skills": skillId },
 *     referenceId: skillId,
 *   });
 */
export async function detachNestedReference<T>(
  model: Model<T>,
  options: {
    filter: string;
    pullPath: string;
    arrayFilter: Record<string, unknown>;
    referenceId: string;
  }
): Promise<void> {
  await model
    .updateMany(
      { [options.filter]: options.referenceId } as QueryFilter<T>,
      { $pull: { [options.pullPath]: options.referenceId } } as UpdateQuery<T>,
      { arrayFilters: [options.arrayFilter] }
    )
    .exec();
}
