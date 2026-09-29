import { useState } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { GLYPH_BOX, INFO_GLYPH, INFO_SIZE, LEAVE_TOUCH_DELAY, TOOLTIP_WIDTH } from "../core/constants";

export function InfoTip({ about, label }: { about: string, label: string; }) {
    const [shown, setShown] = useState(false);

    return (
        <Tooltip
            title={about}
            open={shown}
            onOpen={() => setShown(true)}
            onClose={() => setShown(false)}
            enterTouchDelay={0}
            leaveTouchDelay={LEAVE_TOUCH_DELAY}
            slotProps={{ tooltip: { sx: { fontSize: theme => theme.typography.body2.fontSize, maxWidth: TOOLTIP_WIDTH } } }}
            placement="bottom-start"
        >
            <IconButton aria-label={label} onClick={() => setShown(open => !open)} size="small" sx={{ color: "text.secondary" }}>
                <Box component="svg" viewBox={GLYPH_BOX} width={INFO_SIZE} height={INFO_SIZE} aria-hidden="true" sx={{ display: "block" }}>
                    <Box component="path" d={INFO_GLYPH} sx={{ fill: "currentColor" }} />
                </Box>
            </IconButton>
        </Tooltip>
    );
}
