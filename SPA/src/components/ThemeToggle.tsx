import { Box, IconButton, Tooltip } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import { GLYPH_BOX, GLYPH_SIZE, MOON_GLYPH, SUN_GLYPH, TO_DARK, TO_LIGHT } from "../core/constants";

export function ThemeToggle() {
    const { mode, systemMode, setMode } = useColorScheme();
    const dark = (mode === "system" ? systemMode : mode) === "dark";
    const label = dark ? TO_LIGHT : TO_DARK;

    return (
        <Tooltip title={label} placement="bottom">
            <IconButton
                onClick={() => setMode(dark ? "light" : "dark")}
                aria-label={label}
                sx={{ color: "inherit", "&:hover": { backgroundColor: "glass.fill" } }}
            >
                <Box component="svg" viewBox={GLYPH_BOX} width={GLYPH_SIZE} height={GLYPH_SIZE} aria-hidden="true" sx={{ display: "block" }}>
                    <Box
                        component="path"
                        d={dark ? SUN_GLYPH : MOON_GLYPH}
                        sx={dark ? { fill: theme => theme.vars.palette.weather.sun } : { fill: "currentColor" }}
                    />
                </Box>
            </IconButton>
        </Tooltip>
    );
}
