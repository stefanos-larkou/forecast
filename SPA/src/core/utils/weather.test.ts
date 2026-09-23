import { describe, expect, it } from "vitest";
import { weatherState } from "./weather";

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
