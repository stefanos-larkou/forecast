import { Chip, Stack, Typography } from "@mui/material";
import { MUTED_ON_SKY, WEATHER_LABELS } from "../core/constants";
import { PREVIEW_STATES } from "../core/utils/preview";
import type { WeatherState } from "../core/models/weather";

export function PreviewBar({ showing, onShow }: { showing: WeatherState | null, onShow: (state: WeatherState | null) => void; }) {
    return (
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center", mt: 2 }}>
            <Typography variant="overline" component="p" sx={{ opacity: MUTED_ON_SKY }}>DEV - Preview Conditions</Typography>
            <Chip label="Forecast" size="small" color={showing === null ? "primary" : "default"} onClick={() => onShow(null)} />
            {PREVIEW_STATES.map(state => (
                <Chip
                    key={state}
                    label={WEATHER_LABELS[state]}
                    size="small"
                    color={showing === state ? "primary" : "default"}
                    onClick={() => onShow(state)}
                />
            ))}
        </Stack>
    );
}
