import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { Forecast } from "../core/models/summary";
import { renderWithProviders } from "../test-utils";
import { DailyOutlook } from "./DailyOutlook";

const TWO_DAYS: Forecast = {
    run_time: "2026-09-22T05:00:00+00:00",
    hours: ["2026-09-22T06:00:00+00:00", "2026-09-22T12:00:00+00:00", "2026-09-23T06:00:00+00:00", "2026-09-23T12:00:00+00:00"],
    variables: {
        temperature_2m: [21.2, 29.4, 19.8, 27.1],
        relative_humidity_2m: [70, 55, 72, 58],
        wind_speed_10m: [8, 12, 7, 11],
        cloud_cover: [10, 40, 15, 35],
        rain_probability: [0, 0.31, 0, 0.002]
    },
    band: {
        variable: "temperature_2m",
        lower: [20.1, 28.0, 18.5, 25.9],
        upper: [22.4, 30.8, 21.0, 28.3]
    }
};

describe("DailyOutlook", () => {
    it("gives each day its own line, with the coldest and warmest hour on it", () => {
        renderWithProviders(<DailyOutlook forecast={TWO_DAYS} />);
        const days = screen.getAllByRole("listitem");

        expect(days).toHaveLength(2);
        const first = within(days[0] ?? document.createElement("li"));
        expect(first.getByText("21.2\u00b0C")).toBeInTheDocument();
        expect(first.getByText("29.4\u00b0C")).toBeInTheDocument();
    });

    it("shows the day's best chance of rain, and nothing when there is none worth showing", () => {
        renderWithProviders(<DailyOutlook forecast={TWO_DAYS} />);
        const days = screen.getAllByRole("listitem");

        expect(within(days[0] ?? document.createElement("li")).getByText("31%")).toBeInTheDocument();
        expect(within(days[1] ?? document.createElement("li")).queryByText(/%/)).not.toBeInTheDocument();
    });

    it("opens that day's hours when a day is clicked", async () => {
        renderWithProviders(<DailyOutlook forecast={TWO_DAYS} />);

        await userEvent.click(screen.getAllByRole("button")[1] ?? document.createElement("button"));
        expect(await screen.findByRole("dialog", { name: /23\/09\/2026/ })).toBeInTheDocument();
    });
});
