import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../test-utils";
import { FallingWeather } from "./FallingWeather";

function canvasesFor(state: "clear" | "partly" | "overcast" | "drizzle" | "rain" | "snow"): number {
    const { container, unmount } = renderWithProviders(<FallingWeather state={state} />);
    const count = container.querySelectorAll("canvas").length;
    unmount();
    return count;
}

describe("FallingWeather", () => {
    it("draws nothing when nothing is falling", () => {
        expect(canvasesFor("clear")).toBe(0);
        expect(canvasesFor("partly")).toBe(0);
        expect(canvasesFor("overcast")).toBe(0);
    });

    it("draws a canvas for rain and for snow", () => {
        expect(canvasesFor("drizzle")).toBe(1);
        expect(canvasesFor("rain")).toBe(1);
        expect(canvasesFor("snow")).toBe(1);
    });
});
