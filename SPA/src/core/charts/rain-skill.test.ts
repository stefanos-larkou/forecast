import { describe, expect, it } from "vitest";
import { SUMMARY } from "../../test-fixtures";
import { rainSkillConfig, rainSkillTable } from "./rain-skill";

const RAIN = SUMMARY.backtest.rain;
const STYLE = {
    series: { ours: "orange", band: "pale orange", ecmwf: "blue", gfs: "green", icon: "purple", reference: "grey" },
    band: "pale orange",
    text: "black",
    grid: "silver",
    font: { family: "Roboto", size: 14 }
};

describe("rainSkillConfig", () => {
    it("draws our model and the three models against the two baselines", () => {
        const datasets = rainSkillConfig(RAIN, STYLE).data.datasets;

        expect(datasets.map(dataset => dataset.label)).toEqual(["gbm_blend", "The Three Models", "Climatology", "Persistence"]);
        expect(datasets[0]).toMatchObject({ data: [0.2449, 0.2329], borderColor: "orange" });
    });

    it("lays climatology flat at zero, the line the skill is measured from", () => {
        const climatology = rainSkillConfig(RAIN, STYLE).data.datasets[2];

        expect(climatology).toMatchObject({ data: [0, 0], borderColor: "grey", borderDash: [6, 4] });
    });
});

describe("rainSkillTable", () => {
    it("gives every lead its skill for each method", () => {
        const table = rainSkillTable(RAIN);

        expect(table.rowHeader).toBe("Hours Ahead");
        expect(table.columns).toEqual(["gbm_blend", "The Three Models", "Climatology", "Persistence"]);
        expect(table.rows[0]).toEqual({ header: "24", values: ["0.24", "0.29", "0.00", "-0.67"] });
    });
});
