import { screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FORECAST, SUMMARY } from "../test-fixtures";
import { renderWithProviders } from "../test-utils";
import { HourlyStrip } from "./HourlyStrip";

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-22T19:30:00Z"));
});

afterEach(() => vi.useRealTimers());

describe("HourlyStrip", () => {
    it("starts at the hour under way and lists the hours after it", () => {
        renderWithProviders(<HourlyStrip forecast={FORECAST} where={SUMMARY.coordinates} />);
        const hours = screen.getAllByRole("listitem");

        expect(hours).toHaveLength(2);
        expect(within(hours[0] ?? document.createElement("li")).getByText("25.4\u00b0C")).toBeInTheDocument();
        expect(within(hours[1] ?? document.createElement("li")).getByText("23.9\u00b0C")).toBeInTheDocument();
    });

    it("gives every hour its time and its chance of rain", () => {
        renderWithProviders(<HourlyStrip forecast={FORECAST} where={SUMMARY.coordinates} />);
        const hour = within(screen.getAllByRole("listitem")[0] ?? document.createElement("li"));

        expect(hour.getByText(/^\d{2}:\d{2}$/)).toBeInTheDocument();
        expect(hour.getByText("5%")).toBeInTheDocument();
    });

    it("marks an hour with a real chance of rain and ignores one too small to round to a percent", () => {
        const barely = { ...FORECAST, variables: { ...FORECAST.variables, rain_probability: [0, 0.06, 0.004] } };
        renderWithProviders(<HourlyStrip forecast={barely} where={SUMMARY.coordinates} />);
        const hours = screen.getAllByRole("listitem");

        expect(within(hours[0] ?? document.createElement("li")).getByText("6%")).toBeInTheDocument();
        expect(within(hours[1] ?? document.createElement("li")).getByText(/%/)).not.toBeVisible();
    });

    it("keeps every hour the same height whether or not rain is worth showing", () => {
        const dry = { ...FORECAST, variables: { ...FORECAST.variables, rain_probability: [0, 0, 0] } };
        const lines = (forecast: typeof FORECAST) => {
            const { unmount } = renderWithProviders(<HourlyStrip forecast={forecast} where={SUMMARY.coordinates} />);
            const count = (screen.getAllByRole("listitem")[0] ?? document.createElement("li")).childElementCount;
            unmount();
            return count;
        };

        expect(lines(dry)).toBe(lines(FORECAST));
    });
});
