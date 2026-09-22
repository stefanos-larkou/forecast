import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SUMMARY } from "../test-fixtures";
import { renderWithProviders } from "../test-utils";
import BacktestSection from "./BacktestSection";

describe("BacktestSection", () => {
    it("gives every variable its own titled, labelled chart, in order", () => {
        renderWithProviders(<BacktestSection backtest={SUMMARY.backtest} />);

        const titles = screen.getAllByRole("heading", { level: 3 }).map(heading => heading.textContent);
        expect(titles).toEqual(["Temperature", "Humidity", "Wind speed", "Cloud cover"]);
        expect(screen.getAllByRole("img")).toHaveLength(4);
    });
});
