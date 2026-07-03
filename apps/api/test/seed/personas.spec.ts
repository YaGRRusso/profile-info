import { PERSONA_KEYS, PERSONAS } from "@seed/personas";

describe("seed personas", () => {
  it("defines the expected dev personas", () => {
    expect(PERSONA_KEYS).toEqual([
      "empty",
      "lite",
      "joao",
      "maria",
      "full",
      "admin",
    ]);
  });

  it("uses short and long display names independent of email", () => {
    expect(PERSONAS.empty.name.length).toBeLessThanOrEqual(2);
    expect(PERSONAS.lite.name.length).toBeLessThanOrEqual(4);
    expect(PERSONAS.full.name.length).toBeGreaterThan(40);
    expect(PERSONAS.joao.email).not.toContain("joão");
  });

  it("assigns full persona the stress-test entity counts", () => {
    expect(PERSONAS.full.entities).toEqual({
      courses: 20,
      educations: 5,
      experiences: 5,
      projects: 10,
    });
  });
});
