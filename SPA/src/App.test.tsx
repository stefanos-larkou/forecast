import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";
import { PLACE } from "./core/constants";
import { renderWithProviders } from "./test-utils";

describe("App", () => {
    it("names the place it forecasts as the page heading", () => {
        renderWithProviders(<App />);
        expect(screen.getByRole("heading", { level: 1, name: PLACE })).toBeInTheDocument();
    });
});
