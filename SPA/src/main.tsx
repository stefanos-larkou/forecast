import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { App } from "./App.tsx";
import { theme } from "./core/theme";

const root = document.getElementById("root");
if (!root) {
    throw new Error("Root element #root was not found in index.html.");
}

createRoot(root).render(
    <StrictMode>
        <ThemeProvider theme={theme} defaultMode="system" noSsr>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </StrictMode>
);
