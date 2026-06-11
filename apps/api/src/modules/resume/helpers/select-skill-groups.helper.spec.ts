import { selectResumeSkillGroups } from "./select-skill-groups.helper";

describe("selectResumeSkillGroups", () => {
  it("caps skills per category by relevance", () => {
    const groups = selectResumeSkillGroups([
      { name: "NestJS", category: "BACKEND", relevance: 5 },
      { name: "Express", category: "BACKEND", relevance: 4 },
      { name: "Fastify", category: "BACKEND", relevance: 3 },
      { name: "Koa", category: "BACKEND", relevance: 2 },
      { name: "Hapi", category: "BACKEND", relevance: 1 },
      { name: "React", category: "FRONTEND", relevance: 5 },
      { name: "Vue", category: "FRONTEND", relevance: 4 },
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
      { name: "TypeScript", category: "LANGUAGE", relevance: 5 },
    ] as never);

    expect(groups).toEqual([{ category: "LANGUAGE", skills: ["TypeScript"] }]);
    expect(groups.some((group) => group.category === "DEVOPS")).toBe(false);
  });
});
