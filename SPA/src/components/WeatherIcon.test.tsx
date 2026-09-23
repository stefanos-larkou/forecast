import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../test-utils";
import { WeatherIcon } from "./WeatherIcon";

describe("WeatherIcon", () => {
    it("names the weather it stands for", () => {
        renderWithProviders(<WeatherIcon state="showers" />);

        expect(screen.getByRole("img", { name: "Rain possible" })).toBeInTheDocument();
    });

    it("draws more drops for rain than for showers, and none without them", () => {
        const drops = (state: "rain" | "showers" | "overcast") => {
            const { unmount } = renderWithProviders(<WeatherIcon state={state} />);
            const count = screen.getByRole("img").querySelectorAll("line").length;
            unmount();
            return count;
        };

        expect(drops("rain")).toBe(3);
        expect(drops("showers")).toBe(2);
        expect(drops("overcast")).toBe(0);
    });
});
