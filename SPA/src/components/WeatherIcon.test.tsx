import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../test-utils";
import type { WeatherState } from "../core/models/weather";
import { WeatherIcon } from "./WeatherIcon";

describe("WeatherIcon", () => {
    it("names the weather it stands for", () => {
        renderWithProviders(<WeatherIcon state="showers" />);

        expect(screen.getByRole("img", { name: "Showers" })).toBeInTheDocument();
    });

    it("draws more drops the harder it rains, and none without rain", () => {
        const drops = (state: WeatherState) => {
            const { unmount } = renderWithProviders(<WeatherIcon state={state} />);
            const count = screen.getByRole("img").querySelectorAll("line").length;
            unmount();
            return count;
        };

        expect(drops("downpour")).toBe(4);
        expect(drops("rain")).toBe(3);
        expect(drops("showers")).toBe(2);
        expect(drops("drizzle")).toBe(2);
        expect(drops("overcast")).toBe(0);
    });

    it("draws flakes instead of drops below freezing", () => {
        const flakes = (state: WeatherState) => {
            const { unmount } = renderWithProviders(<WeatherIcon state={state} />);
            const found = screen.getByRole("img");
            const count = { circles: found.querySelectorAll("circle").length, lines: found.querySelectorAll("line").length };
            unmount();
            return count;
        };

        expect(flakes("snow")).toEqual({ circles: 2, lines: 0 });
        expect(flakes("heavySnow")).toEqual({ circles: 3, lines: 0 });
    });
});
