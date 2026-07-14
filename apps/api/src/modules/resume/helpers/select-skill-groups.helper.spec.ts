import { Locale } from "@/common/i18n/locales";
import { selectResumeSkillGroups } from "./select-skill-groups.helper";

describe("selectResumeSkillGroups", () => {
  it("caps skills per category preserving input order", () => {
    const groups = selectResumeSkillGroups(
      [
        {
          category: "BACKEND",
          i18n: [{ locale: "en", messages: { title: "NestJS" } }],
          id: "1",
          slug: "nestjs",
        },
        {
          category: "BACKEND",
          i18n: [{ locale: "en", messages: { title: "Express" } }],
          id: "2",
          slug: "express",
        },
        {
          category: "BACKEND",
          i18n: [{ locale: "en", messages: { title: "Fastify" } }],
          id: "3",
          slug: "fastify",
        },
        {
          category: "BACKEND",
          i18n: [{ locale: "en", messages: { title: "Koa" } }],
          id: "4",
          slug: "koa",
        },
        {
          category: "BACKEND",
          i18n: [{ locale: "en", messages: { title: "Hapi" } }],
          id: "5",
          slug: "hapi",
        },
        {
          category: "FRONTEND",
          i18n: [{ locale: "en", messages: { title: "React" } }],
          id: "6",
          slug: "react",
        },
        {
          category: "FRONTEND",
          i18n: [{ locale: "en", messages: { title: "Vue" } }],
          id: "7",
          slug: "vue",
        },
      ] as never,
      Locale.EN
    );

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
    const groups = selectResumeSkillGroups(
      [
        {
          category: "LANGUAGE",
          i18n: [{ locale: "en", messages: { title: "TypeScript" } }],
          id: "1",
          slug: "typescript",
        },
      ] as never,
      Locale.EN
    );

    expect(groups).toEqual([{ category: "LANGUAGE", skills: ["TypeScript"] }]);
    expect(groups.some((group) => group.category === "DEVOPS")).toBe(false);
  });

  it("uses localized title for the requested locale", () => {
    const groups = selectResumeSkillGroups(
      [
        {
          category: "Soft Skills",
          i18n: [
            { locale: Locale.EN, messages: { title: "Customer Service" } },
            {
              locale: Locale.PT,
              messages: { title: "Atendimento ao Cliente" },
            },
          ],
          id: "1",
          slug: "customer-service",
        },
      ] as never,
      Locale.PT
    );

    expect(groups).toEqual([
      { category: "Soft Skills", skills: ["Atendimento ao Cliente"] },
    ]);
  });

  it("falls back to slug when i18n is empty", () => {
    const groups = selectResumeSkillGroups(
      [
        {
          category: "OTHER",
          i18n: [],
          id: "1",
          slug: "legacy-skill",
        },
      ] as never,
      Locale.EN
    );

    expect(groups).toEqual([{ category: "OTHER", skills: ["legacy-skill"] }]);
  });

  it("lists uncategorized skills first without mixing categories", () => {
    const groups = selectResumeSkillGroups(
      [
        {
          category: "BACKEND",
          i18n: [{ locale: "en", messages: { title: "NestJS" } }],
          id: "1",
          slug: "nestjs",
        },
        {
          i18n: [{ locale: "pt", messages: { title: "Oratória" } }],
          id: "2",
          slug: "oratoria",
        },
        {
          i18n: [{ locale: "pt", messages: { title: "Exemplo" } }],
          id: "3",
          slug: "exemplo",
        },
        {
          i18n: [{ locale: "pt", messages: { title: "Abc" } }],
          id: "4",
          slug: "abc",
        },
      ] as never,
      Locale.PT
    );

    expect(groups).toEqual([
      { category: "", skills: ["Oratória", "Exemplo", "Abc"] },
      { category: "BACKEND", skills: ["NestJS"] },
    ]);
  });
});
