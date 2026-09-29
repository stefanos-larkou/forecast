import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../test-utils";
import { SiteBar } from "./SiteBar";
import { HOME_LABEL, HOME_URL, TO_DARK, TO_LIGHT } from "../core/constants";

describe("SiteBar", () => {
    it("leads back to the site this page belongs to", () => {
        renderWithProviders(<SiteBar />);

        expect(screen.getByRole("link", { name: HOME_LABEL })).toHaveAttribute("href", HOME_URL);
    });

    it("sits in a landmark, so the way out can be found without reading the page", () => {
        renderWithProviders(<SiteBar />);

        expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("offers the theme that is not already showing", async () => {
        renderWithProviders(<SiteBar />);
        const toggle = screen.getByRole("button", { name: TO_DARK });

        await userEvent.click(toggle);

        expect(screen.getByRole("button", { name: TO_LIGHT })).toBeInTheDocument();
    });
});
