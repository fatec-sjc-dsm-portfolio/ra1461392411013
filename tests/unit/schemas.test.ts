import { describe, expect, it } from "vitest";
import { z } from "astro/zod";
import { createProjectSchema, LocalizedList } from "../../src/lib/schemas";
import { validApiProject } from "../fixtures/api-valid";

const schema = createProjectSchema(z.string());

describe("project schema", () => {
  it("accepts a valid API project", () => {
    expect(schema.safeParse(validApiProject).success).toBe(true);
  });

  it("rejects a project missing contribution.en", () => {
    const { contribution, ...rest } = validApiProject;
    const broken = { ...rest, contribution: { pt: contribution.pt } };
    const result = schema.safeParse(broken);
    expect(result.success).toBe(false);
  });

  it("rejects a project missing contribution.pt", () => {
    const { contribution, ...rest } = validApiProject;
    const broken = { ...rest, contribution: { en: contribution.en } };
    const result = schema.safeParse(broken);
    expect(result.success).toBe(false);
  });

  it("rejects pt/en lists of different sizes", () => {
    const result = LocalizedList.safeParse({
      pt: ["a", "b"],
      en: ["a"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an API project without api, takeaway or image", () => {
    const { api, takeaway, image, ...rest } = validApiProject;
    const result = schema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("accepts a personal project without api, takeaway or image", () => {
    const { api, takeaway, image, ...rest } = validApiProject;
    const personal = { ...rest, kind: "personal" as const };
    expect(schema.safeParse(personal).success).toBe(true);
  });
});
