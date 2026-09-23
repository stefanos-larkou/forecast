import { describe, expect, it } from "vitest";
import { SUMMARY } from "../../test-fixtures";
import { rainAmountConfig, rainAmountTable } from "./rain-amount";

const AMOUNT = SUMMARY.backtest.rain.amount;
const STYLE = {
    series: { ours: "orange", band: "pale orange", ecmwf: "blue", gfs: "green", icon: "purple", reference: "grey" },
    band: "pale orange",
    text: "black",
    grid: "silver",
    font: { family: "Roboto", size: 14 }
};

describe("rainAmountConfig", () => {
    it("draws our model against a typical wet hour and the three models", () => {
        const datasets = rainAmountConfig(AMOUNT, STYLE).data.datasets;

        expect(datasets.map(dataset => dataset.label)).toEqual(["gbm_blend", "a typical wet hour", "the three models"]);
        expect(datasets[0]).toMatchObject({ data: [0.3475, 0.35], borderColor: "orange" });
        expect(datasets[1]).toMatchObject({ data: [0.3731, 0.3746], borderDash: [6, 4] });
    });
});

describe("rainAmountTable", () => {
    it("gives every lead its error for each method", () => {
        const table = rainAmountTable(AMOUNT);

        expect(table.rowHeader).toBe("Hours Ahead");
        expect(table.columns).toEqual(["gbm_blend", "a typical wet hour", "the three models"]);
        expect(table.rows[0]).toEqual({ header: "24", values: ["0.35", "0.37", "0.40"] });
    });
});
