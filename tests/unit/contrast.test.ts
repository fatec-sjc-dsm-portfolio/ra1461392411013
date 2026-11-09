import { describe, expect, it } from "vitest";
import { contrastRatio, tokens } from "../../src/lib/contrast";

describe.each(["light", "dark"] as const)("%s theme contrast", (theme) => {
  const t = tokens[theme];

  it("text on bg is at least 4.5:1", () => {
    expect(contrastRatio(t.text, t.bg)).toBeGreaterThanOrEqual(4.5);
  });

  it("muted on bg is at least 4.5:1", () => {
    expect(contrastRatio(t.muted, t.bg)).toBeGreaterThanOrEqual(4.5);
  });

  it("accent on bg is at least 4.5:1", () => {
    expect(contrastRatio(t.accent, t.bg)).toBeGreaterThanOrEqual(4.5);
  });

  it("border-strong on bg is at least 3:1", () => {
    expect(contrastRatio(t.borderStrong, t.bg)).toBeGreaterThanOrEqual(3);
  });

  it("accent on accent-subtle (badge text) is at least 4.5:1", () => {
    expect(contrastRatio(t.accent, t.accentSubtle)).toBeGreaterThanOrEqual(4.5);
  });

  it("on-accent on accent (button text) is at least 4.5:1", () => {
    expect(contrastRatio(t.onAccent, t.accent)).toBeGreaterThanOrEqual(4.5);
  });
});
