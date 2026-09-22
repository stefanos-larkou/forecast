import { describe, expect, it } from "vitest";
import { formatError } from "./format";

describe("formatError", () => {
    it("always shows two decimals, however many the value has", () => {
        expect(formatError(0.7201)).toBe("0.72");
        expect(formatError(14.1893)).toBe("14.19");
        expect(formatError(4)).toBe("4.00");
    });
});
