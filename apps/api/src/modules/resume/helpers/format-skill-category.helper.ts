const SKILL_CATEGORY_REGEX = /[\s_-]+/;

export function formatSkillCategoryLabel(category: string): string {
  return category
    .toLowerCase()
    .split(SKILL_CATEGORY_REGEX)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
