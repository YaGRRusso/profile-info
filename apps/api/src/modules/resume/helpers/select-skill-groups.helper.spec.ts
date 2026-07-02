import { Locale } from "@/common/i18n/locales";
import { selectResumeSkillGroups } from "./select-skill-groups.helper";

describe("selectResumeSkillGroups", () => {
  it("caps skills per category preserving input order", () => {
    const groups = selectResumeSkillGroups(
      [
        {
          id: "1",
          slug: "nestjs",
          category: "BACKEND",
          i18n: [{ locale: "en", messages: { title: "NestJS" } }],
        },
        {
          id: "2",
          slug: "express",
          category: "BACKEND",
          i18n: [{ locale: "en", messages: { title: "Express" } }],
        },
        {
          id: "3",
          slug: "fastify",
          category: "BACKEND",
          i18n: [{ locale: "en", messages: { title: "Fastify" } }],
        },
        {
          id: "4",
          slug: "koa",
          category: "BACKEND",
          i18n: [{ locale: "en", messages: { title: "Koa" } }],
        },
        {
          id: "5",
          slug: "hapi",
          category: "BACKEND",
          i18n: [{ locale: "en", messages: { title: "Hapi" } }],
        },
        {
          id: "6",
          slug: "react",
          category: "FRONTEND",
          i18n: [{ locale: "en", messages: { title: "React" } }],
        },
        {
          id: "7",
          slug: "vue",
          category: "FRONTEND",
          i18n: [{ locale: "en", messages: { title: "Vue" } }],
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
          id: "1",
          slug: "typescript",
          category: "LANGUAGE",
          i18n: [{ locale: "en", messages: { title: "TypeScript" } }],
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
          id: "1",
          slug: "customer-service",
          category: "Soft Skills",
          i18n: [
            { locale: Locale.EN, messages: { title: "Customer Service" } },
            {
              locale: Locale.PT,
              messages: { title: "Atendimento ao Cliente" },
            },
          ],
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
          id: "1",
          slug: "legacy-skill",
          category: "OTHER",
          i18n: [],
        },
      ] as never,
      Locale.EN
    );

    expect(groups).toEqual([{ category: "OTHER", skills: ["legacy-skill"] }]);
  });
});
