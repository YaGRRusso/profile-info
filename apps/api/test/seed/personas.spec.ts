import { PERSONA_KEYS, PERSONAS } from "@seed/personas";

describe("seed personas", () => {
  it("defines the expected dev personas", () => {
    expect(PERSONA_KEYS).toEqual([
      "empty",
      "joao",
      "maria",
      "full",
      "pending",
      "admin",
    ]);
    expect([...PERSONA_KEYS].sort()).toEqual(Object.keys(PERSONAS).sort());
  });

  it("uses short and long display names independent of email", () => {
    expect(PERSONAS.empty.name).toBe("Empty");
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

  it("assigns local catalog counts for multi-tenant personas", () => {
    expect(PERSONAS.empty.localCatalog).toEqual({
      organizations: 0,
      skills: 0,
    });
    expect(PERSONAS.joao.localCatalog).toEqual({ organizations: 2, skills: 4 });
    expect(PERSONAS.maria.localCatalog).toEqual({
      organizations: 2,
      skills: 4,
    });
    expect(PERSONAS.pending.localCatalog).toEqual({
      organizations: 0,
      skills: 0,
    });
    expect(PERSONAS.admin.localCatalog).toEqual({
      organizations: 0,
      skills: 0,
    });
  });

  it("marks pending persona as disabled for approval-queue QA", () => {
    expect(PERSONAS.pending.disabled).toBe(true);
    expect(PERSONAS.pending.email).toBe("pending@profile.info");
    expect(PERSONAS.empty.disabled).toBeUndefined();
  });
});
