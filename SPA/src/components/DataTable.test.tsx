import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../test-utils";
import { DataTable } from "./DataTable";

const TABLE = {
    rowHeader: "Hours Ahead",
    columns: ["gbm_blend", "ECMWF"],
    rows: [
        { header: "24", values: ["0.72", "1.22"] },
        { header: "48", values: ["0.75", "1.35"] }
    ]
};

function row(index: number): string[] {
    const rows = screen.getAllByRole("row");
    return within(rows[index] ?? document.createElement("tr")).getAllByRole(index === 0 ? "columnheader" : "cell")
        .map(box => box.textContent ?? "");
}

describe("DataTable", () => {
    it("heads the first column with the row header and the rest with the columns", () => {
        renderWithProviders(<DataTable table={TABLE} label="Errors" />);

        expect(row(0)).toEqual(["Hours Ahead", "gbm_blend", "ECMWF"]);
    });

    it("gives each row its header and its values in order", () => {
        renderWithProviders(<DataTable table={TABLE} label="Errors" />);

        expect(screen.getByRole("rowheader", { name: "24" })).toBeInTheDocument();
        expect(row(1)).toEqual(["0.72", "1.22"]);
        expect(row(2)).toEqual(["0.75", "1.35"]);
    });
});
