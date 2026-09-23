import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CROSSOVER_HEADING } from "../core/constants";
import { SUMMARY } from "../test-fixtures";
import { renderWithProviders } from "../test-utils";
import { SkillHorizon } from "./SkillHorizon";

function block(name: string) {
    const heading = screen.getByRole("heading", { level: 3, name });
    return within(heading.parentElement ?? document.createElement("div"));
}

describe("SkillHorizon", () => {
    it("gives every variable a block, headed by the question", () => {
        renderWithProviders(<SkillHorizon backtest={SUMMARY.backtest} />);

        expect(screen.getByRole("heading", { level: 2, name: CROSSOVER_HEADING })).toBeInTheDocument();
        expect(screen.getAllByRole("heading", { level: 3 }).map(heading => heading.textContent))
            .toEqual(["Temperature", "Humidity", "Wind Speed", "Cloud Cover"]);
    });

    it("says how far each method holds, and beyond when it never loses", () => {
        renderWithProviders(<SkillHorizon backtest={SUMMARY.backtest} />);
        const temperature = block("Temperature");

        expect(temperature.getByText("gbm_blend")).toBeInTheDocument();
        expect(temperature.getAllByText("Beyond")).toHaveLength(6);
        expect(temperature.getByText("144 h")).toBeInTheDocument();
    });

    it("shows what correcting a model buys it", () => {
        renderWithProviders(<SkillHorizon backtest={SUMMARY.backtest} />);
        const humidity = block("Humidity");
        const values = humidity.getAllByRole("definition").map(value => value.textContent);

        expect(values).toEqual(["Beyond", "120 h", "24 h", "144 h", "24 h", "72 h", "24 h"]);
    });
});
