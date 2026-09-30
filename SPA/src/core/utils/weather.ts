import * as SunCalc from "suncalc";
import { CHANCE_OF_RAIN, CHANCE_OF_SNOW, CLOUD_CLEAR_UNDER, CLOUD_OVERCAST_FROM, RAIN_DOWNPOUR_FROM, RAIN_DRIZZLE_UNDER, RAIN_LIKELY_FROM, RAIN_POSSIBLE_FROM, RAIN_SPELL_SHARE, SNOW_MAX_C, SNOW_STATES } from "../constants";
import type { Coordinates } from "../models/summary";
import type { WeatherState } from "../models/weather";

export function chanceLabel(state: WeatherState): string {
    return SNOW_STATES.includes(state) ? CHANCE_OF_SNOW : CHANCE_OF_RAIN;
}

function dryState(cloud: number): WeatherState {
    if (cloud >= CLOUD_OVERCAST_FROM) return "overcast";
    return cloud < CLOUD_CLEAR_UNDER ? "clear" : "partly";
}

export function weatherState({ rain, amount, cloud, temperature }: { rain: number, amount: number, cloud: number, temperature: number; }): WeatherState {
    if (rain < RAIN_POSSIBLE_FROM) {
        return dryState(cloud);
    }

    const likely = rain >= RAIN_LIKELY_FROM;
    const heavy = amount >= RAIN_DOWNPOUR_FROM;

    if (temperature <= SNOW_MAX_C) {
        return likely && heavy ? "heavySnow" : "snow";
    }

    if (amount < RAIN_DRIZZLE_UNDER) return "drizzle";
    if (!likely) return "showers";
    return heavy ? "downpour" : "rain";
}

export interface Conditions {
    rain: number;
    amount: number;
    cloud: number;
    temperature: number;
}

function mean(values: number[]): number {
    return values.reduce((total, value) => total + value, 0) / values.length;
}

export function dayState(hours: Conditions[]): WeatherState {
    const wet = hours.filter(hour => hour.rain >= RAIN_POSSIBLE_FROM);
    const temperature = mean(hours.map(hour => hour.temperature));

    if (wet.length === 0) {
        return dryState(mean(hours.map(hour => hour.cloud)));
    }

    const peak = Math.max(...wet.map(hour => hour.rain));
    const heaviest = Math.max(...wet.map(hour => hour.amount));

    if (temperature <= SNOW_MAX_C) {
        return wet.length / hours.length >= RAIN_SPELL_SHARE && heaviest >= RAIN_DOWNPOUR_FROM ? "heavySnow" : "snow";
    }

    if (wet.length / hours.length >= RAIN_SPELL_SHARE) {
        return heaviest >= RAIN_DOWNPOUR_FROM ? "downpour" : "rain";
    }

    return peak >= RAIN_LIKELY_FROM ? "showers" : "drizzle";
}

export function isNight(at: string, where: Coordinates): boolean {
    return SunCalc.getPosition(new Date(at), where.latitude, where.longitude).altitude <= 0;
}
