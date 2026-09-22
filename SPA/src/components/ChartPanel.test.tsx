import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../test-utils";
import { ChartPanel } from "./ChartPanel";

const CONFIG = { type: "line" as const, data: { labels: [24, 48], datasets: [{ data: [1, 2] }] } };
const TABLE = { rowHeader: "Hours ahead", columns: ["gbm_blend"], rows: [{ header: "24", values: ["0.72"] }] };
const LABEL = "Temperature: mean absolute error";

function panel() {
    return <ChartPanel title="Temperature" label={LABEL} config={CONFIG} table={TABLE} />;
}

describe("ChartPanel", () => {
    it("titles itself and names its chart for screen readers", () => {
        renderWithProviders(panel());

        expect(screen.getByRole("heading", { level: 3, name: "Temperature" })).toBeInTheDocument();
        expect(screen.getByRole("img", { name: LABEL })).toBeInTheDocument();
    });

    it("shows the table in the chart's place, and puts the chart back", async () => {
        renderWithProviders(panel());

        await userEvent.click(screen.getByRole("button", { name: "Show as table" }));
        expect(screen.getByRole("table")).toBeInTheDocument();
        expect(screen.queryByRole("img", { name: LABEL })).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: "Show as chart" }));
        expect(screen.getByRole("img", { name: LABEL })).toBeInTheDocument();
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
});
