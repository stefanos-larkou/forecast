import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../test-utils";
import { Credits } from "./Credits";
import { CREDIT_SOURCE, CREDIT_SOURCE_URL } from "../core/constants";

describe("Credits", () => {
    it("credits the weather data to its source, under the licence that asks for it", () => {
        renderWithProviders(<Credits />);

        const source = screen.getByRole("link", { name: CREDIT_SOURCE });
        expect(source).toHaveAttribute("href", CREDIT_SOURCE_URL);
        expect(screen.getByText(/Weather data by/)).toHaveTextContent("CC BY 4.0");
    });

    it("sits in a footer, so it is found however the page is read", () => {
        renderWithProviders(<Credits />);

        expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });
});
