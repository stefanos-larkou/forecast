import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../test-utils";
import { ChartCanvas } from "./ChartCanvas";

const LABEL = "A line through three points";

describe("ChartCanvas", () => {
    it("names its chart for screen readers, even where it cannot draw", () => {
        renderWithProviders(<ChartCanvas config={{ type: "line", data: { labels: [1, 2, 3], datasets: [{ data: [1, 3, 2] }] } }} label={LABEL} />);
        expect(screen.getByRole("img", { name: LABEL })).toBeInTheDocument();
    });
});
