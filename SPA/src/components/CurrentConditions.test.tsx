import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FORECAST } from "../test-fixtures";
import { renderWithProviders } from "../test-utils";
import { CurrentConditions } from "./CurrentConditions";

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-22T19:30:00Z"));
});

afterEach(() => vi.useRealTimers());

describe("CurrentConditions", () => {
    it("shows the hour that is under way, not the first one published", () => {
        renderWithProviders(<CurrentConditions forecast={FORECAST} />);

        expect(screen.getByText("25.4\u00b0C")).toBeInTheDocument();
        expect(screen.getByText(/23.8\u00b0C to 26.9\u00b0C/)).toBeInTheDocument();
    });

    it("says when the forecast was issued", () => {
        renderWithProviders(<CurrentConditions forecast={FORECAST} />);

        expect(screen.getByText(/Forecast issued 22\/09\/2026/)).toBeInTheDocument();
    });

    it("shows the rest of that hour's weather in its own units", () => {
        renderWithProviders(<CurrentConditions forecast={FORECAST} />);

        expect(screen.getByText("5%")).toBeInTheDocument();
        expect(screen.getByText("14%")).toBeInTheDocument();
        expect(screen.getByText("7 km/h")).toBeInTheDocument();
        expect(screen.getByText("71%")).toBeInTheDocument();
    });
});
