import type { SeriesPalette } from "../theme";

export interface ChartFont {
    family: string;
    size: number;
}

export interface ChartStyle {
    series: SeriesPalette;
    text: string;
    grid: string;
    font: ChartFont;
}

export interface TableRow {
    header: string;
    values: string[];
}

export interface ChartTable {
    rowHeader: string;
    columns: string[];
    rows: TableRow[];
}
