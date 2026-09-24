import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SUMMARY } from "../test-fixtures";
import { renderWithProviders } from "../test-utils";
import BacktestSection from "./BacktestSection";
import { AMOUNT_CAPTION, AMOUNT_HEADING, BACKTEST_CAPTION, BACKTEST_HEADING, COVERAGE_CAPTION, COVERAGE_HEADING } from "../core/constants";

describe("BacktestSection", () => {
    it("gives every variable its own titled, labelled chart, in order", () => {
        renderWithProviders(<BacktestSection backtest={SUMMARY.backtest} />);

        const titles = screen.getAllByRole("heading", { level: 3 }).map(heading => heading.textContent);
        expect(screen.getByRole("heading", { level: 2, name: BACKTEST_HEADING })).toBeInTheDocument();
        expect(titles.slice(0, 5)).toEqual(["Temperature", "Humidity", "Wind Speed", "Cloud Cover", AMOUNT_HEADING]);
        expect(screen.getAllByRole("img")).toHaveLength(6);
    });

    it("states the window and the number of forecasts the backtest covers", () => {
        renderWithProviders(<BacktestSection backtest={SUMMARY.backtest} />);

        expect(screen.getByText(/322,096 forecasts, March 2025 - September 2026/)).toBeInTheDocument();
    });

    it("says what the error is measured against, and that it is not the live record", () => {
        renderWithProviders(<BacktestSection backtest={SUMMARY.backtest} />);

        expect(screen.getByText(BACKTEST_CAPTION)).toBeInTheDocument();
    });

    it("scores how much rain falls over wet hours alone, beside the four variables", () => {
        renderWithProviders(<BacktestSection backtest={SUMMARY.backtest} />);

        expect(screen.getByRole("heading", { level: 3, name: AMOUNT_HEADING })).toBeInTheDocument();
        expect(screen.getByText(AMOUNT_CAPTION)).toBeInTheDocument();
    });

    it("asks whether the band holds, and says which window answered it", () => {
        renderWithProviders(<BacktestSection backtest={SUMMARY.backtest} />);

        expect(screen.getByRole("heading", { level: 3, name: COVERAGE_HEADING })).toBeInTheDocument();
        expect(screen.getByText(/78,912 forecasts, June 2025 - September 2026/)).toBeInTheDocument();
        expect(screen.getByText(COVERAGE_CAPTION)).toBeInTheDocument();
    });
});
