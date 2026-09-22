import { describe, expect, it } from "vitest";
import { FORECAST } from "../../test-fixtures";
import { currentRow, hourlyRows } from "./forecast";

const ROWS = hourlyRows(FORECAST);

describe("hourlyRows", () => {
    it("gives one row per hour, with every value from that same hour", () => {
        expect(ROWS).toHaveLength(3);
        expect(ROWS[0]).toEqual({
            at: "2026-09-22T18:00:00+00:00",
            temperature: 26.28,
            lower: 24.63,
            upper: 27.27,
            rain: 0.02,
            cloud: 9.77,
            wind: 7.26,
            humidity: 68.17
        });
        expect(ROWS[2]?.temperature).toBe(23.9);
    });
});

describe("currentRow", () => {
    it("picks the latest hour that has already begun", () => {
        expect(currentRow(ROWS, new Date("2026-09-22T19:30:00Z"))?.at).toBe("2026-09-22T19:00:00+00:00");
        expect(currentRow(ROWS, new Date("2026-09-22T20:00:00Z"))?.at).toBe("2026-09-22T20:00:00+00:00");
    });

    it("falls back to the first hour when the forecast is still ahead of now", () => {
        expect(currentRow(ROWS, new Date("2026-09-22T17:30:00Z"))?.at).toBe("2026-09-22T18:00:00+00:00");
    });

    it("has nothing to give when there are no hours", () => {
        expect(currentRow([], new Date())).toBeUndefined();
    });
});
