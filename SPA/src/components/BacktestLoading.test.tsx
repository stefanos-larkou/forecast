import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BACKTEST_HEADING } from "../core/constants";
import { renderWithProviders } from "../test-utils";
import { BacktestLoading } from "./BacktestLoading";

describe("BacktestLoading", () => {
    it("holds the section's place with one waiting panel per variable", () => {
        renderWithProviders(<BacktestLoading />);

        expect(screen.getByRole("heading", { level: 2, name: BACKTEST_HEADING })).toBeInTheDocument();
        expect(screen.getAllByRole("progressbar")).toHaveLength(4);
        expect(screen.getByText("Cloud Cover")).toBeInTheDocument();
    });
});
