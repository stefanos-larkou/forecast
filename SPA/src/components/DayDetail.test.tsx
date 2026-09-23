import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { hourlyRows } from "../core/utils/forecast";
import { FORECAST } from "../test-fixtures";
import { renderWithProviders } from "../test-utils";
import DayDetail from "./DayDetail";

const HOURS = hourlyRows(FORECAST);

// The dialog gives focus back to whatever had it when it closes, and jsdom starts
// with nothing focused, so the tests open it from a real button.
beforeEach(() => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
});

describe("DayDetail", () => {
    it("names the day it is showing and describes its chart", () => {
        renderWithProviders(<DayDetail hours={HOURS} onClose={() => undefined} />);

        expect(screen.getByRole("dialog", { name: /22\/09\/2026/ })).toBeInTheDocument();
        expect(screen.getByRole("img", { name: /Temperature with its 90% band/ })).toBeInTheDocument();
    });

    it("can show the same hours as a table", async () => {
        renderWithProviders(<DayDetail hours={HOURS} onClose={() => undefined} />);

        await userEvent.click(screen.getByRole("button", { name: "Show as table" }));
        expect(screen.getAllByRole("rowheader")).toHaveLength(3);
        expect(screen.getByRole("cell", { name: "24.6\u00b0C - 27.3\u00b0C" })).toBeInTheDocument();
    });

    it("closes when asked", async () => {
        const close = vi.fn();
        renderWithProviders(<DayDetail hours={HOURS} onClose={close} />);

        await userEvent.click(screen.getByRole("button", { name: "Close" }));
        expect(close).toHaveBeenCalled();
    });
});
