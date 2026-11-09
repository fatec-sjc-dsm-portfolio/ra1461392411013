import { describe, expect, it } from "vitest";
import { formatPeriod } from "../../src/lib/period";

describe("formatPeriod", () => {
  it("formats a same-year range", () => {
    expect(formatPeriod("2024-03", "2024-06", "pt")).toBe("mar–jun 2024");
    expect(formatPeriod("2024-03", "2024-06", "en")).toBe("Mar–Jun 2024");
  });

  it("formats an ongoing period", () => {
    expect(formatPeriod("2025-08", null, "pt")).toBe("ago 2025 – atual");
    expect(formatPeriod("2025-08", null, "en")).toBe("Aug 2025 – present");
  });

  it("formats a range across years", () => {
    expect(formatPeriod("2024-09", "2025-02", "pt")).toBe("set 2024 – fev 2025");
    expect(formatPeriod("2024-09", "2025-02", "en")).toBe("Sep 2024 – Feb 2025");
  });
});
