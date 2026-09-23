import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../test-utils";
import { ScrollStrip } from "./ScrollStrip";

let scrollLeft = 0;

function measurements(scrollWidth: number) {
    scrollLeft = 0;
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(400);
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(scrollWidth);
    Object.defineProperty(HTMLElement.prototype, "scrollLeft", {
        get: () => scrollLeft,
        set: value => {
            scrollLeft = value;
        },
        configurable: true
    });
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
}

function scrolled(to: number) {
    scrollLeft = to;
    act(() => {
        fireEvent.scroll(screen.getByRole("list"));
    });
}

function strip() {
    return (
        <ScrollStrip back="Earlier" forward="Later">
            <li>one</li>
            <li>two</li>
        </ScrollStrip>
    );
}

describe("ScrollStrip", () => {
    it("pages through its contents with its buttons", async () => {
        const scrollBy = vi.fn();
        measurements(1200);
        Object.defineProperty(HTMLElement.prototype, "scrollBy", { value: scrollBy, configurable: true });

        const user = userEvent.setup();
        renderWithProviders(strip());

        await user.click(screen.getByRole("button", { name: "Later" }));
        expect(scrollBy).toHaveBeenCalledWith({ left: 320, behavior: "smooth" });

        scrolled(800);
        await user.click(screen.getByRole("button", { name: "Earlier" }));
        expect(scrollBy).toHaveBeenLastCalledWith({ left: -320, behavior: "smooth" });
    });

    it("scrolls when dragged with a mouse", async () => {
        measurements(1200);

        const user = userEvent.setup();
        renderWithProviders(strip());
        const list = screen.getByRole("list");

        await user.pointer([
            { keys: "[MouseLeft>]", target: list, coords: { clientX: 300, clientY: 0 } },
            { target: list, coords: { clientX: 220, clientY: 0 } },
            { keys: "[/MouseLeft]", target: list }
        ]);

        expect(list.scrollLeft).toBe(80);
    });

    it("hides the button for a direction it cannot go", () => {
        measurements(1200);
        renderWithProviders(strip());

        expect(screen.getByRole("button", { name: "Earlier" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Later" })).toBeEnabled();

        scrolled(800);

        expect(screen.getByRole("button", { name: "Earlier" })).toBeEnabled();
        expect(screen.getByRole("button", { name: "Later" })).toBeDisabled();
    });

    it("lets a click through to what is under it, but not the end of a drag", async () => {
        measurements(1200);
        const pressed = vi.fn();
        const user = userEvent.setup();
        renderWithProviders(
            <ScrollStrip back="Earlier" forward="Later">
                <li><button type="button" onClick={pressed}>one</button></li>
            </ScrollStrip>
        );
        const card = screen.getByRole("button", { name: "one" });

        await user.click(card);
        expect(pressed).toHaveBeenCalledTimes(1);

        await user.pointer([
            { keys: "[MouseLeft>]", target: card, coords: { clientX: 300, clientY: 0 } },
            { target: card, coords: { clientX: 200, clientY: 0 } },
            { keys: "[/MouseLeft]", target: card }
        ]);

        expect(pressed).toHaveBeenCalledTimes(1);
    });

    it("hides both buttons when everything already fits", () => {
        measurements(200);
        renderWithProviders(strip());

        expect(screen.getByRole("button", { name: "Earlier" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Later" })).toBeDisabled();
    });
});
