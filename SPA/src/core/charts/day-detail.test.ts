import { describe, expect, it } from "vitest";
import { FORECAST } from "../../test-fixtures";
import { hourlyRows } from "../utils/forecast";
import { dayDetailConfig, dayDetailTable } from "./day-detail";

const HOURS = hourlyRows(FORECAST);
const STYLE = {
    series: { ours: "orange", band: "pale orange", ecmwf: "blue", gfs: "green", icon: "purple", reference: "grey" },
    band: "pale orange",
    text: "black",
    grid: "silver",
    font: { family: "Roboto", size: 14 }
};

describe("dayDetailConfig", () => {
    it("draws the band as a fill between the upper and lower edges", () => {
        const [upper, lower] = dayDetailConfig(HOURS, STYLE).data.datasets;

        expect(upper).toMatchObject({ label: "90% band", data: [27.27, 26.9, 25.6], fill: "+1", backgroundColor: "pale orange" });
        expect(lower).toMatchObject({ label: "", data: [24.63, 23.8, 22.4] });
    });

    it("puts the temperature over the band and the rain on its own axis", () => {
        const datasets = dayDetailConfig(HOURS, STYLE).data.datasets;

        expect(datasets[2]).toMatchObject({ label: "Temperature", data: [26.28, 25.41, 23.9], borderColor: "orange" });
        expect(datasets[3]).toMatchObject({ type: "bar", label: "Chance of rain", data: [2, 5, 11], yAxisID: "rain" });
    });
});

describe("dayDetailTable", () => {
    it("gives every hour its temperature, its band and its chance of rain", () => {
        const table = dayDetailTable(HOURS);

        expect(table.columns).toEqual(["Temperature", "90% band", "Chance of rain"]);
        expect(table.rows).toHaveLength(3);
        expect(table.rows[0]?.values).toEqual(["26.3\u00b0C", "24.6\u00b0C - 27.3\u00b0C", "2%"]);
    });
});
