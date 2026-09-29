import { describe, expect, it } from "vitest";
import { formatError, formatMonth, formatScientific } from "./format";

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

describe("formatScientific", () => {
    it("writes a value as a mantissa times a power of ten", () => {
        expect(formatScientific(0.0000097)).toBe("9.7\u00d710\u207b\u2076");
        expect(formatScientific(0.000166)).toBe("1.66\u00d710\u207b\u2074");
        expect(formatScientific(1500)).toBe("1.5\u00d710\u00b3");
    });

    it("carries no more of a tick's floating point noise than it has to", () => {
        expect(formatScientific(0.000012000000000000002)).toBe("1.2\u00d710\u207b\u2075");
    });

    it("leaves zero as a bare zero", () => {
        expect(formatScientific(0)).toBe("0");
    });
});
