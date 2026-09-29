import { Box, IconButton, Stack, Tooltip } from "@mui/material";
import { BACK_GLYPH, GLYPH_BOX, GLYPH_SIZE, HOME_LABEL, HOME_URL } from "../core/constants";
import { ThemeToggle } from "./ThemeToggle";

function BackArrow() {
    return (
        <Box component="svg" viewBox={GLYPH_BOX} width={GLYPH_SIZE} height={GLYPH_SIZE} aria-hidden="true" sx={{ display: "block" }}>
            <Box component="path" d={BACK_GLYPH} sx={{ fill: "currentColor" }} />
        </Box>
    );
}

export function SiteBar() {
    return (
        <Stack direction="row" component="nav" sx={{ alignItems: "center", justifyContent: "space-between", mx: -1 }}>
            <Tooltip title={HOME_LABEL} placement="bottom">
                <IconButton component="a" href={HOME_URL} aria-label={HOME_LABEL} sx={{ color: "inherit", "&:hover": { backgroundColor: "glass.fill" } }}>
                    <BackArrow />
                </IconButton>
            </Tooltip>
            <ThemeToggle />
        </Stack>
    );
}
