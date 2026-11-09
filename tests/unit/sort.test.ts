import { describe, expect, it } from "vitest";
import { sortApiProjects, sortPersonalProjects } from "../../src/lib/sort";

function apiFixtures() {
  return [1, 2, 3, 4, 5, 6].map((semester) => ({
    id: `s${semester}`,
    data: { draft: false, api: { semester } },
  }));
}

describe("sortApiProjects", () => {
  it("orders 7 fixtures by semester descending and drops drafts", () => {
    const fixtures = [
      ...apiFixtures(),
      { id: "draft", data: { draft: true, api: { semester: 7 } } },
    ];
    const sorted = sortApiProjects(fixtures);
    expect(sorted.map((e) => e.id)).toEqual(["s6", "s5", "s4", "s3", "s2", "s1"]);
  });
});

describe("sortPersonalProjects", () => {
  it("orders by period.start descending and drops drafts", () => {
    const fixtures = [
      { id: "old", data: { draft: false, period: { start: "2024-11" } } },
      { id: "new", data: { draft: false, period: { start: "2025-01" } } },
      { id: "draft", data: { draft: true, period: { start: "2026-01" } } },
    ];
    const sorted = sortPersonalProjects(fixtures);
    expect(sorted.map((e) => e.id)).toEqual(["new", "old"]);
  });
});
