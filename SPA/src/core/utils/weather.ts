import * as SunCalc from "suncalc";
import { CLOUD_CLEAR_UNDER, CLOUD_OVERCAST_FROM, RAIN_LIKELY_FROM, RAIN_POSSIBLE_FROM } from "../constants";
import type { Coordinates } from "../models/summary";

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

export function isNight(at: string, where: Coordinates): boolean {
    return SunCalc.getPosition(new Date(at), where.latitude, where.longitude).altitude <= 0;
}
