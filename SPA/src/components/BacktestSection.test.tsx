import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SUMMARY } from "../test-fixtures";
import { renderWithProviders } from "../test-utils";
import BacktestSection from "./BacktestSection";
import { AMOUNT_CAPTION, AMOUNT_HEADING, BACKTEST_CAPTION, BACKTEST_HEADING, COVERAGE_CAPTION, COVERAGE_HEADING, COVERAGE_SECTION, RAIN_HEADING, RAIN_SKILL_CAPTION, RAIN_SKILL_HEADING, RELIABILITY_CAPTION, RELIABILITY_HEADING } from "../core/constants";

describe("BacktestSection", () => {
    it("gives every variable its own titled, labelled chart, in order", () => {
        renderWithProviders(<BacktestSection backtest={SUMMARY.backtest} />);

        const titles = screen.getAllByRole("heading", { level: 3 }).map(heading => heading.textContent);
        expect(screen.getByRole("heading", { level: 2, name: BACKTEST_HEADING })).toBeInTheDocument();
        expect(titles.slice(0, 4)).toEqual(["Temperature", "Humidity", "Wind Speed", "Cloud Cover"]);
        expect(screen.getAllByRole("img")).toHaveLength(8);
    });

    it("states the window and the number of forecasts the backtest covers", () => {
        renderWithProviders(<BacktestSection backtest={SUMMARY.backtest} />);

        expect(screen.getByText(/322,096 forecasts, March 2025 - September 2026/)).toBeInTheDocument();
    });

    it("says what the error is measured against, and that it is not the live record", () => {
        renderWithProviders(<BacktestSection backtest={SUMMARY.backtest} />);

        expect(screen.getByText(BACKTEST_CAPTION)).toBeInTheDocument();
    });

    it("gathers the chance of rain, the check on it and how much falls under one heading", () => {
        renderWithProviders(<BacktestSection backtest={SUMMARY.backtest} />);

        expect(screen.getByRole("heading", { level: 2, name: RAIN_HEADING })).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 3, name: RAIN_SKILL_HEADING })).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 3, name: RELIABILITY_HEADING })).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 3, name: AMOUNT_HEADING })).toBeInTheDocument();
        expect(screen.getByText(/5\.5% of hours were wet/)).toBeInTheDocument();
    });

    it("gives each rain chart the caption that explains it", () => {
        renderWithProviders(<BacktestSection backtest={SUMMARY.backtest} />);

        expect(screen.getByText(RAIN_SKILL_CAPTION)).toBeInTheDocument();
        expect(screen.getByText(RELIABILITY_CAPTION)).toBeInTheDocument();
        expect(screen.getByText(AMOUNT_CAPTION)).toBeInTheDocument();
    });

    it("heads the intervals section with the question it answers and the window it covers", () => {
        renderWithProviders(<BacktestSection backtest={SUMMARY.backtest} />);

        expect(screen.getByRole("heading", { level: 2, name: COVERAGE_SECTION })).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 3, name: COVERAGE_HEADING })).toBeInTheDocument();
        expect(screen.getByText(/78,912 forecasts, June 2025 - September 2026/)).toBeInTheDocument();
        expect(screen.getByText(COVERAGE_CAPTION)).toBeInTheDocument();
    });
});
