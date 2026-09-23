import { CLOUD_CLEAR_UNDER, CLOUD_OVERCAST_FROM, RAIN_LIKELY_FROM, RAIN_POSSIBLE_FROM } from "../constants";

export type WeatherState = "rain" | "showers" | "overcast" | "partly" | "clear";

export const WEATHER_LABELS: Record<WeatherState, string> = {
    rain: "Rain likely",
    showers: "Rain possible",
    overcast: "Overcast",
    partly: "Partly cloudy",
    clear: "Clear"
};

export function weatherState({ rain, cloud }: { rain: number, cloud: number; }): WeatherState {
    if (rain >= RAIN_LIKELY_FROM) return "rain";
    if (rain >= RAIN_POSSIBLE_FROM) return "showers";
    if (cloud >= CLOUD_OVERCAST_FROM) return "overcast";
    return cloud < CLOUD_CLEAR_UNDER ? "clear" : "partly";
}