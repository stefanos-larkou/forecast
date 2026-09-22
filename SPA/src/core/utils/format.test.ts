import { describe, expect, it } from "vitest";
import { formatError, formatMonth } from "./format";

describe("formatError", () => {
    it("always shows two decimals, however many the value has", () => {
        expect(formatError(0.7201)).toBe("0.72");
        expect(formatError(14.1893)).toBe("14.19");
        expect(formatError(4)).toBe("4.00");
    });
});

describe("formatMonth", () => {
    it("names the month and year a summary month stands for", () => {
        expect(formatMonth("2025-03")).toBe("March 2025");
        expect(formatMonth("2026-09")).toBe("September 2026");
    });
});