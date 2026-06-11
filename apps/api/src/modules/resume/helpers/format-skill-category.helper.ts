const SKILL_CATEGORY_LABELS: Record<string, string> = {
  BACKEND: "Backend",
  DATA: "Data",
  DEVOPS: "DevOps",
  FRONTEND: "Frontend",
  LANGUAGE: "Languages",
};

export function formatSkillCategoryLabel(category: string): string {
  return (
    SKILL_CATEGORY_LABELS[category] ??
    category
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}
