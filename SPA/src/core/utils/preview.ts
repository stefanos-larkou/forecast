import type { Summary } from "../models/summary";
import type { WeatherState } from "../models/weather";

interface Condition {
    rain: number;
    amount: number;
    cloud: number;
    temperature: number;
}

const CONDITIONS: Record<WeatherState, Condition> = {
    clear: { rain: 0, amount: 0, cloud: 5, temperature: 28 },
    partly: { rain: 0, amount: 0, cloud: 45, temperature: 27 },
    overcast: { rain: 0.1, amount: 0, cloud: 90, temperature: 24 },
    drizzle: { rain: 0.6, amount: 0.3, cloud: 85, temperature: 20 },
    showers: { rain: 0.4, amount: 1.5, cloud: 85, temperature: 19 },
    rain: { rain: 0.8, amount: 2, cloud: 92, temperature: 17 },
    downpour: { rain: 0.9, amount: 6, cloud: 97, temperature: 16 },
    snow: { rain: 0.6, amount: 1, cloud: 92, temperature: 0 },
    heavySnow: { rain: 0.9, amount: 5, cloud: 97, temperature: -2 }
};

const PREVIEW_SPREAD = 1.5;

export const PREVIEW_STATES = Object.keys(CONDITIONS) as WeatherState[];

export function withPreview(summary: Summary, state: WeatherState): Summary {
    const forecast = summary.forecast;
    if (!forecast) {
        return summary;
    }

    const condition = CONDITIONS[state];
    const every = (value: number) => forecast.hours.map(() => value);

    return {
        ...summary,
        forecast: {
            ...forecast,
            variables: {
                ...forecast.variables,
                temperature_2m: every(condition.temperature),
                cloud_cover: every(condition.cloud),
                rain_probability: every(condition.rain),
                rain_amount: every(condition.amount)
            },
            band: {
                ...forecast.band,
                lower: every(condition.temperature - PREVIEW_SPREAD),
                upper: every(condition.temperature + PREVIEW_SPREAD)
            }
        }
    };
}
