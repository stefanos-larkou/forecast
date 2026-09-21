import { describe, expect, it } from "vitest";
import { SUMMARY } from "../../test-fixtures";
import { errorRows } from "./error-rows";

describe("errorRows", () => {
    it("gives one row per series and lead, with each error beside its own lead", () => {
        const rows = errorRows(SUMMARY.backtest, "temperature_2m");

        expect(rows).toHaveLength(12);
        expect(rows).toContainEqual({ series: "gbm_blend", lead: 24, error: 0.72 });
        expect(rows).toContainEqual({ series: "gbm_blend", lead: 48, error: 0.75 });
        expect(rows).toContainEqual({ series: "persistence", lead: 48, error: 1.49 });
    });
});
