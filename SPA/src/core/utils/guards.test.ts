import { describe, expect, it } from "vitest";
import { SUMMARY } from "../../test-fixtures";
import { isSummary } from "./guards";

const TEMPERATURE = SUMMARY.backtest.metrics.mae.temperature_2m;

function withTemperatureErrors(errors: Record<string, unknown>) {
    return {
        ...SUMMARY,
        backtest: {
            ...SUMMARY.backtest,
            metrics: { mae: { ...SUMMARY.backtest.metrics.mae, temperature_2m: errors } }
        }
    };
}

describe("isSummary", () => {
    it("accepts a summary with every variable and series the page draws", () => {
        expect(isSummary(SUMMARY)).toBe(true);
    });

    it("rejects a backtest series without one error per lead", () => {
        expect(isSummary(withTemperatureErrors({ ...TEMPERATURE, boosted: [0.72] }))).toBe(false);
    });

    it("rejects a backtest missing a series the page draws", () => {
        expect(isSummary(withTemperatureErrors({ ...TEMPERATURE, persisted: undefined }))).toBe(false);
    });
});
