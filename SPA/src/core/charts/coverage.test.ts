import { describe, expect, it } from "vitest";
import { SUMMARY } from "../../test-fixtures";
import { coverageConfig, coverageTable } from "./coverage";

const COVERAGE = SUMMARY.backtest.coverage;
const STYLE = {
    series: { ours: "orange", band: "pale orange", ecmwf: "blue", gfs: "green", icon: "purple", reference: "grey" },
    band: "pale orange",
    text: "black",
    grid: "silver",
    font: { family: "Roboto", size: 14 }
};

describe("coverageConfig", () => {
    it("draws a line per variable and the level they all aim for", () => {
        const datasets = coverageConfig(COVERAGE, STYLE).data.datasets;

        expect(datasets.map(dataset => dataset.label)).toEqual(["Temperature", "Humidity", "Wind Speed", "Cloud Cover", "Target (90.0%)"]);
        expect(datasets[0]).toMatchObject({ data: [0.7917, 0.7969], borderColor: "orange" });
    });

    it("holds the target flat across every lead", () => {
        const target = coverageConfig(COVERAGE, STYLE).data.datasets[4];

        expect(target).toMatchObject({ data: [0.9, 0.9], borderColor: "grey", borderDash: [6, 4] });
    });
});

describe("coverageTable", () => {
    it("gives every lead its share for each variable", () => {
        const table = coverageTable(COVERAGE);

        expect(table.rowHeader).toBe("Hours Ahead");
        expect(table.columns).toEqual(["Temperature", "Humidity", "Wind Speed", "Cloud Cover", "Target (90.0%)"]);
        expect(table.rows[0]).toEqual({ header: "24", values: ["79.2%", "86.6%", "90.5%", "82.6%", "90.0%"] });
    });
});
