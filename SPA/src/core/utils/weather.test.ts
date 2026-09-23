import { describe, expect, it } from "vitest";
import { chanceLabel, isNight, weatherState } from "./weather";
import { SUMMARY } from "../../test-fixtures";

const WARM = 20;

function state(rain: number, amount: number, cloud = 90, temperature = WARM): string {
    return weatherState({ rain, amount, cloud, temperature });
}

describe("weatherState", () => {
    it("falls back to how much cloud there is when rain is unlikely", () => {
        expect(state(0.29, 8, 70)).toBe("overcast");
        expect(state(0, 0, 40)).toBe("partly");
        expect(state(0, 0, 24)).toBe("clear");
    });

    it("names the intensity from the millimetres once rain is more likely than not", () => {
        expect(state(0.55, 0.49)).toBe("drizzle");
        expect(state(0.55, 0.5)).toBe("rain");
        expect(state(0.9, 3.99)).toBe("rain");
        expect(state(0.9, 4)).toBe("downpour");
    });

    it("promises no more than showers while rain is merely possible", () => {
        expect(state(0.3, 0.5)).toBe("showers");
        expect(state(0.54, 9)).toBe("showers");
    });

    it("calls the same millimetres drizzle at every chance of rain", () => {
        expect(state(0.3, 0.2)).toBe("drizzle");
        expect(state(0.54, 0.2)).toBe("drizzle");
        expect(state(0.99, 0.2)).toBe("drizzle");
    });

    it("turns to snow at freezing, and calls it heavy only where rain would have been a downpour", () => {
        expect(state(0.3, 0.2, 90, 1)).toBe("snow");
        expect(state(0.9, 3.9, 90, 0)).toBe("snow");
        expect(state(0.54, 9, 90, 0)).toBe("snow");
        expect(state(0.9, 4, 90, 0)).toBe("heavySnow");
    });
});

describe("chanceLabel", () => {
    it("names what would fall, not always rain", () => {
        expect(chanceLabel("snow")).toBe("Chance of snow");
        expect(chanceLabel("heavySnow")).toBe("Chance of snow");
        expect(chanceLabel("drizzle")).toBe("Chance of rain");
        expect(chanceLabel("clear")).toBe("Chance of rain");
    });
});

describe("isNight", () => {
    const larnaca = SUMMARY.coordinates;

    it("goes by the sun, not the clock: dark before sunrise, light after it", () => {
        expect(isNight("2026-09-23T03:00:00Z", larnaca)).toBe(true);
        expect(isNight("2026-09-23T04:00:00Z", larnaca)).toBe(false);
        expect(isNight("2026-09-23T16:00:00Z", larnaca)).toBe(true);
    });

    it("follows the seasons: half past seven is light in June and dark in December", () => {
        expect(isNight("2026-06-21T16:30:00Z", larnaca)).toBe(false);
        expect(isNight("2026-12-21T15:00:00Z", larnaca)).toBe(true);
    });
});
