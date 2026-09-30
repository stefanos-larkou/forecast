import { describe, expect, it } from "vitest";
import { chanceLabel, dayState, isNight, weatherState } from "./weather";
import { SUMMARY } from "../../test-fixtures";
import type { Conditions } from "./weather";

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

describe("dayState", () => {
    const hour = (rain: number, over: Partial<Conditions> = {}): Conditions =>
        ({ rain, amount: 0.2, cloud: 30, temperature: 20, ...over });

    const day = (wet: number, rain: number, over: Partial<Conditions> = {}): Conditions[] =>
        [...Array(24)].map((_, index) => hour(index < wet ? rain : 0, over));

    it("calls a day dry when no hour is wet, and says how cloudy it was", () => {
        expect(dayState(day(0, 0, { cloud: 10 }))).toBe("clear");
        expect(dayState(day(0, 0, { cloud: 40 }))).toBe("partly");
        expect(dayState(day(0, 0, { cloud: 90 }))).toBe("overcast");
    });

    it("calls it rain once a quarter of the day is wet, however light each hour is", () => {
        expect(dayState(day(7, 0.61))).toBe("rain");
        expect(dayState(day(6, 0.51))).toBe("rain");
    });

    it("keeps a brief spell a shower, however sure that hour is", () => {
        expect(dayState(day(1, 0.9))).toBe("showers");
    });

    it("reads an afternoon of rain as rain, where its average hour looks dry", () => {
        const afternoon = [...Array(24)].map((_, index) => hour(index >= 12 && index < 19 ? 0.61 : 0.02));

        expect(dayState(afternoon)).toBe("rain");
    });

    it("keeps one uncertain hour from turning the day into a washout", () => {
        const spell = [...Array(24)].map((_, index) => hour(index === 14 ? 0.38 : 0.01));

        expect(dayState(spell)).toBe("drizzle");
    });

    it("promotes a wet day to a downpour on the heaviest hour it holds", () => {
        expect(dayState(day(7, 0.61, { amount: 6 }))).toBe("downpour");
    });

    it("turns to snow when the day is cold enough, wet for long or not", () => {
        expect(dayState(day(7, 0.61, { temperature: 0 }))).toBe("snow");
        expect(dayState(day(1, 0.61, { temperature: 0 }))).toBe("snow");
        expect(dayState(day(7, 0.61, { temperature: 0, amount: 6 }))).toBe("heavySnow");
    });
});
