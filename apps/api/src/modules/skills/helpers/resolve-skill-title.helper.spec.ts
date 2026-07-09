import { Locale } from "@/common/i18n/locales";
import { resolveSkillTitle } from "./resolve-skill-title.helper";

describe("resolveSkillTitle", () => {
  const skill = {
    slug: "customer-service",
    i18n: [
      { locale: Locale.EN, messages: { title: "Customer Service" } },
      { locale: Locale.PT, messages: { title: "Atendimento ao Cliente" } },
    ],
  };

  it("returns translated title for the requested locale", () => {
    expect(resolveSkillTitle(skill, Locale.PT)).toBe("Atendimento ao Cliente");
  });

  it("falls back to slug when i18n has no match", () => {
    expect(resolveSkillTitle({ slug: "excel", i18n: [] }, Locale.PT)).toBe(
      "excel"
    );
  });
});
