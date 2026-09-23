import { screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FORECAST, SUMMARY } from "../test-fixtures";
import { renderWithProviders } from "../test-utils";
import { CurrentConditions } from "./CurrentConditions";

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-22T19:30:00Z"));
});

afterEach(() => vi.useRealTimers());

function hero() {
    return within(screen.getByRole("region", { name: "Current conditions" }));
}

describe("CurrentConditions", () => {
    it("shows the hour that is under way, not the first one published", () => {
        renderWithProviders(<CurrentConditions forecast={FORECAST} where={SUMMARY.coordinates} />);

        expect(hero().getByText("25.4\u00b0C")).toBeInTheDocument();
        expect(hero().getByText(/23.8\u00b0C - 26.9\u00b0C/)).toBeInTheDocument();
    });

    it("shows the rest of that hour's weather in its own units", () => {
        renderWithProviders(<CurrentConditions forecast={FORECAST} where={SUMMARY.coordinates} />);

        expect(screen.getAllByRole("definition").map(value => value.textContent)).toEqual(["5%", "14%", "7 km/h", "71%"]);
    });

    it("names the weather and says when the forecast was issued", () => {
        renderWithProviders(<CurrentConditions forecast={FORECAST} where={SUMMARY.coordinates} />);

        expect(hero().getByText(/^Clear . forecast issued 22\/09\/2026/)).toBeInTheDocument();
    });
});
