import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VARIABLES } from "../core/constants";
import { SUMMARY } from "../test-fixtures";
import { renderWithProviders } from "../test-utils";
import { ErrorByLeadChart } from "./ErrorByLeadChart";

const [, , WIND] = VARIABLES;

describe("ErrorByLeadChart", () => {
    it("titles the panel with its variable and describes the chart with its unit", () => {
        renderWithProviders(<ErrorByLeadChart backtest={SUMMARY.backtest} variable={WIND} />);

        expect(screen.getByRole("heading", { level: 3, name: "Wind speed" })).toBeInTheDocument();
        expect(screen.getByRole("img", { name: /mean absolute error in km\/h/ })).toBeInTheDocument();
    });
});
