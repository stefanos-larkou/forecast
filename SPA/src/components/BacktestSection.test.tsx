import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SUMMARY } from "../test-fixtures";
import { renderWithProviders } from "../test-utils";
import BacktestSection from "./BacktestSection";
import { BACKTEST_HEADING } from "../core/constants";

describe("BacktestSection", () => {
    it("gives every variable its own titled, labelled chart, in order", () => {
        renderWithProviders(<BacktestSection backtest={SUMMARY.backtest} />);

        const titles = screen.getAllByRole("heading", { level: 3 }).map(heading => heading.textContent);
        expect(screen.getByRole("heading", { level: 2, name: BACKTEST_HEADING })).toBeInTheDocument();
        expect(titles).toEqual(["Temperature", "Humidity", "Wind Speed", "Cloud Cover"]);
        expect(screen.getAllByRole("img")).toHaveLength(4);
    });
});
