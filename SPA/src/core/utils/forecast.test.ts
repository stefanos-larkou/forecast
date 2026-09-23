import { describe, expect, it } from "vitest";
import { FORECAST } from "../../test-fixtures";
import { currentRow, dailyRows, hourlyRows, hoursOfDay, upcomingRows } from "./forecast";

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
            amount: 0,
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

describe("upcomingRows", () => {
    it("starts at the hour under way, not at the first hour published", () => {
        const upcoming = upcomingRows(ROWS, new Date("2026-09-22T19:30:00Z"));

        expect(upcoming.map(row => row.at)).toEqual(["2026-09-22T19:00:00+00:00", "2026-09-22T20:00:00+00:00"]);
    });

    it("never runs past the hours it was given", () => {
        expect(upcomingRows(ROWS, new Date("2026-09-22T17:00:00Z"))).toHaveLength(3);
        expect(upcomingRows([], new Date())).toEqual([]);
    });
});

describe("dailyRows", () => {
    it("keeps the hours of one day together, with its coldest and warmest hour", () => {
        const days = dailyRows(ROWS);

        expect(days).toHaveLength(1);
        expect(days[0]).toEqual({ at: "2026-09-22T18:00:00+00:00", high: 26.28, low: 23.9, rain: 0.11, state: "clear" });
    });

    it("has nothing to summarise when there are no hours", () => {
        expect(dailyRows([])).toEqual([]);
    });
});

describe("hoursOfDay", () => {
    it("gives back the hours that share a day with the one asked for", () => {
        expect(hoursOfDay(ROWS, "2026-09-22T19:00:00+00:00")).toEqual(ROWS);
    });

    it("has nothing to give for a day the forecast does not reach", () => {
        expect(hoursOfDay(ROWS, "2026-10-05T12:00:00+00:00")).toEqual([]);
    });
});
