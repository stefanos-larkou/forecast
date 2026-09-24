import { describe, expect, it } from "vitest";
import { FORECAST, SUMMARY } from "../../test-fixtures";
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

    it("accepts a summary with no forecast yet", () => {
        expect(isSummary({ ...SUMMARY, forecast: null })).toBe(true);
    });

    it("rejects a forecast whose variable has fewer values than it has hours", () => {
        const variables = { ...FORECAST.variables, cloud_cover: [9.77, 14.2] };
        expect(isSummary({ ...SUMMARY, forecast: { ...FORECAST, variables } })).toBe(false);
    });

    it("rejects a forecast whose band does not cover every hour", () => {
        const band = { ...FORECAST.band, upper: [27.27, 26.9] };
        expect(isSummary({ ...SUMMARY, forecast: { ...FORECAST, band } })).toBe(false);
    });

    it("rejects a backtest with no interval coverage to draw", () => {
        const backtest = { ...SUMMARY.backtest, coverage: undefined };
        expect(isSummary({ ...SUMMARY, backtest })).toBe(false);
    });

    it("rejects coverage that misses a variable the chart plots", () => {
        const inside = { ...SUMMARY.backtest.coverage.inside, cloud_cover: undefined };
        const backtest = { ...SUMMARY.backtest, coverage: { ...SUMMARY.backtest.coverage, inside } };
        expect(isSummary({ ...SUMMARY, backtest })).toBe(false);
    });

    it("rejects rain without the skill and reliability the section needs", () => {
        const backtest = { ...SUMMARY.backtest, rain: { amount: SUMMARY.backtest.rain.amount } };
        expect(isSummary({ ...SUMMARY, backtest })).toBe(false);
    });

    it("rejects a reliability bin that is not a chance, a share and a count", () => {
        const reliability = { ...SUMMARY.backtest.rain.reliability, boosted: [[0.5, 0.5]] };
        const backtest = { ...SUMMARY.backtest, rain: { ...SUMMARY.backtest.rain, reliability } };
        expect(isSummary({ ...SUMMARY, backtest })).toBe(false);
    });

    it("accepts a summary written before the table inventory existed", () => {
        expect(isSummary({ ...SUMMARY, tables: undefined })).toBe(true);
    });

    it("rejects a table counted with something other than a whole number of rows", () => {
        const tables = [{ name: "data/forecasts", rows: 60075.5, files: 26 }];
        expect(isSummary({ ...SUMMARY, tables })).toBe(false);
    });
});
