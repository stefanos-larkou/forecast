import { describe, expect, it } from "vitest";
import { VARIABLES } from "../constants";
import { SUMMARY } from "../../test-fixtures";
import { errorByLeadConfig, errorByLeadTable } from "./error-by-lead";

const [TEMPERATURE] = VARIABLES;
const STYLE = {
    series: { ours: "orange", ecmwf: "blue", gfs: "green", icon: "purple", reference: "grey" },
    text: "black",
    grid: "silver",
    font: { family: "Roboto", size: 14 }
};
const CONFIG = errorByLeadConfig(SUMMARY.backtest, TEMPERATURE, STYLE);
const DATASETS = CONFIG.data.datasets;

describe("errorByLeadConfig", () => {
    it("draws one line per series, in legend order, each in its palette colour", () => {
        expect(DATASETS.map(dataset => dataset.label)).toEqual(["gbm_blend", "ECMWF", "GFS", "ICON", "climatology", "persistence"]);
        expect(DATASETS.map(dataset => dataset.borderColor)).toEqual(["orange", "blue", "green", "purple", "grey", "grey"]);
    });

    it("draws our model thickest and each baseline in its own dash", () => {
        expect(DATASETS.map(dataset => dataset.borderWidth)).toEqual([3, 1.5, 1.5, 1.5, 1.5, 1.5]);
        expect(DATASETS.map(dataset => dataset.borderDash)).toEqual([[], [], [], [], [6, 4], [2, 3]]);
    });

    it("plots each series' errors against the leads they belong to", () => {
        expect(CONFIG.data.labels).toEqual([24, 48]);
        expect(DATASETS[0]?.data).toEqual([0.72, 0.75]);
        expect(DATASETS[5]?.data).toEqual([1.09, 1.49]);
    });

    it("labels the error axis with the variable's unit and starts it at zero", () => {
        expect(CONFIG.options?.scales?.y).toMatchObject({ beginAtZero: true, title: { text: "Mean Absolute Error (\u00b0C)" } });
    });
});

describe("errorByLeadTable", () => {
    it("gives a column per series and a row per lead, to two decimals", () => {
        const table = errorByLeadTable(SUMMARY.backtest, TEMPERATURE);

        expect(table.rowHeader).toBe("Hours Ahead");
        expect(table.columns).toEqual(["gbm_blend", "ECMWF", "GFS", "ICON", "climatology", "persistence"]);
        expect(table.rows).toEqual([
            { header: "24", values: ["0.72", "1.22", "0.90", "0.94", "1.49", "1.09"] },
            { header: "48", values: ["0.75", "1.35", "0.94", "0.96", "1.49", "1.49"] }
        ]);
    });
});
