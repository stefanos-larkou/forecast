import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SUMMARY } from "../test-fixtures";
import { renderWithProviders } from "../test-utils";
import { StatusStrip } from "./StatusStrip";

describe("StatusStrip", () => {
    it("pairs each figure of the live record with its label, dates day first", () => {
        renderWithProviders(<StatusStrip summary={SUMMARY} />);

        const labels = screen.getAllByRole("term").map(term => term.textContent);
        const values = screen.getAllByRole("definition").map(definition => definition.textContent);

        expect(Object.fromEntries(labels.map((label, index) => [label, values[index]]))).toEqual({
            "Updated": expect.stringMatching(/^21\/09\/2026 \d{2}:\d{2}$/),
            "Live since": "17/09/2026",
            "Snapshots": "14",
            "Forecasts saved": "33,000",
            "Graded so far": "0",
            "Model": "2026-09-20"
        });
    });
});
