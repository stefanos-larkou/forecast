import { describe, expect, it } from "vitest";
import { SUMMARY } from "../../test-fixtures";
import { hourlyRows } from "./forecast";
import { PREVIEW_STATES, withPreview } from "./preview";
import { weatherState } from "./weather";

describe("withPreview", () => {
    it("gives every state readings that produce it", () => {
        for (const state of PREVIEW_STATES) {
            const forecast = withPreview(SUMMARY, state).forecast;
            if (forecast === null) {
                throw new Error(`${state} left the summary without a forecast.`);
            }

            expect(hourlyRows(forecast).map(weatherState)).toEqual(forecast.hours.map(() => state));
        }
    });

    it("leaves a summary with no forecast alone", () => {
        expect(withPreview({ ...SUMMARY, forecast: null }, "rain").forecast).toBeNull();
    });
});
