import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SUMMARY } from "../test-fixtures";
import { renderWithProviders } from "../test-utils";
import { DataInventory } from "./DataInventory";
import { EXPLORE_HEADING, TABLE_COVERS } from "../core/constants";

describe("DataInventory", () => {
    it("lists every table with its rows, its files and what it covers", () => {
        renderWithProviders(<DataInventory tables={SUMMARY.tables} />);

        const row = screen.getByRole("row", { name: /data\/backfill/ });
        expect(within(row).getByText("2,244,757")).toBeInTheDocument();
        expect(within(row).getByText("936")).toBeInTheDocument();
        expect(within(row).getByText(TABLE_COVERS["data/backfill"] ?? "")).toBeInTheDocument();
    });

    it("heads the section and names the table for a screen reader", () => {
        renderWithProviders(<DataInventory tables={SUMMARY.tables} />);

        expect(screen.getByRole("heading", { level: 2, name: EXPLORE_HEADING })).toBeInTheDocument();
        expect(screen.getByRole("table", { name: EXPLORE_HEADING })).toBeInTheDocument();
    });

    it("totals the rows and files across every table", () => {
        renderWithProviders(<DataInventory tables={SUMMARY.tables} />);

        expect(screen.getByText(/2,304,832 rows/)).toBeInTheDocument();
        expect(screen.getByText(/962 files/)).toBeInTheDocument();
    });

    it("shows nothing at all when no table has been counted", () => {
        const { container } = renderWithProviders(<DataInventory tables={[]} />);

        expect(container).toBeEmptyDOMElement();
    });

    it("stays quiet for a summary written before the inventory existed", () => {
        const { container } = renderWithProviders(<DataInventory tables={undefined} />);

        expect(container).toBeEmptyDOMElement();
    });
});
