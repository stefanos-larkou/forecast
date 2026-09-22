import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VARIABLES } from "../core/constants";
import { SUMMARY } from "../test-fixtures";
import { renderWithProviders } from "../test-utils";
import { ErrorByLeadChart } from "./ErrorByLeadChart";
import userEvent from "@testing-library/user-event";

const [, , WIND] = VARIABLES;

describe("ErrorByLeadChart", () => {
    it("titles the panel with its variable and describes the chart with its unit", () => {
        renderWithProviders(<ErrorByLeadChart backtest={SUMMARY.backtest} variable={WIND} />);

        expect(screen.getByRole("heading", { level: 3, name: "Wind Speed" })).toBeInTheDocument();
        expect(screen.getByRole("img", { name: /mean absolute error in km\/h/ })).toBeInTheDocument();
    });

    it("shows this variable's own errors in its table", async () => {
        renderWithProviders(<ErrorByLeadChart backtest={SUMMARY.backtest} variable={WIND} />);

        await userEvent.click(screen.getByRole("button", { name: "Show as table" }));
        expect(screen.getByRole("rowheader", { name: "24" })).toBeInTheDocument();
        expect(screen.getByRole("cell", { name: "3.03" })).toBeInTheDocument();
    });
});
