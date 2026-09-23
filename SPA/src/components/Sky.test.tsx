import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../test-utils";
import { Sky } from "./Sky";

const CONTENT = "under the sky";

function backdropBackground(): string {
    const backdrop = screen.getByText(CONTENT).parentElement?.parentElement;
    if (!backdrop) {
        throw new Error("The sky's backdrop was not found.");
    }

    return getComputedStyle(backdrop).background;
}

describe("Sky", () => {
    it("puts what it is given in front of the weather", () => {
        renderWithProviders(<Sky state="clear" night={false}><p>{CONTENT}</p></Sky>);

        expect(screen.getByText(CONTENT)).toBeInTheDocument();
    });

    it("paints a different sky by night, and a duller one when it rains", () => {
        const { unmount: unmountDay } = renderWithProviders(<Sky state="clear" night={false}><p>{CONTENT}</p></Sky>);
        const day = backdropBackground();
        unmountDay();

        const { unmount: unmountNight } = renderWithProviders(<Sky state="clear" night><p>{CONTENT}</p></Sky>);
        const night = backdropBackground();
        unmountNight();

        renderWithProviders(<Sky state="rain" night={false}><p>{CONTENT}</p></Sky>);
        const wet = backdropBackground();

        expect(day).not.toBe(night);
        expect(day).not.toBe(wet);
    });
});
