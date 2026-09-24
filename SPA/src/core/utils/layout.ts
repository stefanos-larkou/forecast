const ONE_COLUMN = "1fr";

export function evenColumns(count: number): string {
    return `repeat(${count}, 1fr)`;
}

export function responsiveColumns(widen: Record<number, string>): Record<string, unknown> {
    return {
        display: "grid",
        gridTemplateColumns: ONE_COLUMN,
        ...Object.fromEntries(Object.entries(widen).map(([from, columns]) => [`@media (min-width: ${from}px)`, { gridTemplateColumns: columns }]))
    };
}
