import { describe, expect, it } from "vitest";
import { isNight, weatherState } from "./weather";
import { SUMMARY } from "../../test-fixtures";

describe("weatherState", () => {
    it("calls it rain when rain is more likely than not, whatever the cloud says", () => {
        expect(weatherState({ rain: 0.7, cloud: 90 })).toBe("rain");
        expect(weatherState({ rain: 0.55, cloud: 10 })).toBe("rain");
    });

    it("calls a lesser chance showers", () => {
        expect(weatherState({ rain: 0.2, cloud: 10 })).toBe("showers");
        expect(weatherState({ rain: 0.54, cloud: 95 })).toBe("showers");
    });

    it("falls back to how much cloud there is when rain is unlikely", () => {
        expect(weatherState({ rain: 0.19, cloud: 70 })).toBe("overcast");
        expect(weatherState({ rain: 0, cloud: 40 })).toBe("partly");
        expect(weatherState({ rain: 0, cloud: 24 })).toBe("clear");
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
