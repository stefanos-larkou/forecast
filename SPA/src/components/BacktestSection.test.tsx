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

    it("states the window and the number of forecasts the backtest covers", () => {
        renderWithProviders(<BacktestSection backtest={SUMMARY.backtest} />);

        expect(screen.getByText(/322,096 forecasts, March 2025 to September 2026/)).toBeInTheDocument();
    });

    it("says what the error is measured against, and that it is not the live record", () => {
        renderWithProviders(<BacktestSection backtest={SUMMARY.backtest} />);

        expect(screen.getByText(/against ERA5/)).toBeInTheDocument();
        expect(screen.getByText(/not the live record/)).toBeInTheDocument();
    });
});
