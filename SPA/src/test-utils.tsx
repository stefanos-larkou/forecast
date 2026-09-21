import type { ReactNode } from "react";
import { ThemeProvider } from "@mui/material";
import { render } from "@testing-library/react";
import { theme } from "./core/theme";

export function renderWithProviders(ui: ReactNode) {
    return render(
        <ThemeProvider theme={theme} defaultMode="system" noSsr>
            {ui}
        </ThemeProvider>
    );
}
