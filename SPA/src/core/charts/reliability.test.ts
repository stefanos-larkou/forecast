import { describe, expect, it } from "vitest";
import { SUMMARY } from "../../test-fixtures";
import { reliabilityConfig, reliabilityTable } from "./reliability";

const RAIN = SUMMARY.backtest.rain;
const STYLE = {
    series: { ours: "orange", band: "pale orange", ecmwf: "blue", gfs: "green", icon: "purple", reference: "grey" },
    band: "pale orange",
    text: "black",
    grid: "silver",
    font: { family: "Roboto", size: 14 }
};

describe("reliabilityConfig", () => {
    it("plots the chance given against the share that was wet", () => {
        const datasets = reliabilityConfig(RAIN, STYLE).data.datasets;

        expect(datasets.map(dataset => dataset.label)).toEqual(["gbm_blend", "The Three Models", "Perfectly honest"]);
        expect(datasets[0]?.data[0]).toEqual({ x: 0.0153, y: 0.0205 });
    });

    it("runs the honest line corner to corner", () => {
        const honest = reliabilityConfig(RAIN, STYLE).data.datasets[2];

        expect(honest?.data).toEqual([{ x: 0, y: 0 }, { x: 1, y: 1 }]);
        expect(honest).toMatchObject({ borderColor: "grey", borderDash: [4, 3] });
    });

    it("sizes each dot by the hours behind it, within bounds", () => {
        const radii = reliabilityConfig(RAIN, STYLE).data.datasets[0]?.pointRadius;

        expect(radii).toEqual([Math.sqrt(69361) / 30, 3, 3]);
    });

    it("holds both axes to the full range, so honest sits on the diagonal", () => {
        const scales = reliabilityConfig(RAIN, STYLE).options?.scales;

        expect(scales?.x).toMatchObject({ min: 0, max: 1 });
        expect(scales?.y).toMatchObject({ min: 0, max: 1 });
    });
});

describe("reliabilityTable", () => {
    it("names every bin by its model and the chance it gave", () => {
        const table = reliabilityTable(RAIN);

        expect(table.columns).toEqual(["Share That Was Wet", "Hours"]);
        expect(table.rows[0]).toEqual({ header: "gbm_blend, 2%", values: ["2%", "69,361"] });
        expect(table.rows[3]).toEqual({ header: "The Three Models, 0%", values: ["2%", "73,223"] });
    });

    it("gives every row a heading no other row shares", () => {
        const headers = reliabilityTable(RAIN).rows.map(row => row.header);

        expect(new Set(headers).size).toBe(headers.length);
    });
});
