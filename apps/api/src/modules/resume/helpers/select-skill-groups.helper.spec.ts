import { selectResumeSkillGroups } from "./select-skill-groups.helper";

describe("selectResumeSkillGroups", () => {
  it("caps skills per category preserving input order", () => {
    const groups = selectResumeSkillGroups([
      { id: "1", name: "NestJS", category: "BACKEND" },
      { id: "2", name: "Express", category: "BACKEND" },
      { id: "3", name: "Fastify", category: "BACKEND" },
      { id: "4", name: "Koa", category: "BACKEND" },
      { id: "5", name: "Hapi", category: "BACKEND" },
      { id: "6", name: "React", category: "FRONTEND" },
      { id: "7", name: "Vue", category: "FRONTEND" },
    ] as never);

    expect(groups).toEqual([
      {
        category: "BACKEND",
        skills: ["NestJS", "Express", "Fastify", "Koa", "Hapi"],
      },
      {
        category: "FRONTEND",
        skills: ["React", "Vue"],
      },
    ]);
  });

  it("omits categories with no skills", () => {
    const groups = selectResumeSkillGroups([
      { id: "1", name: "TypeScript", category: "LANGUAGE" },
    ] as never);

    expect(groups).toEqual([{ category: "LANGUAGE", skills: ["TypeScript"] }]);
    expect(groups.some((group) => group.category === "DEVOPS")).toBe(false);
  });
});
