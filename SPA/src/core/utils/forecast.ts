import { HOURS_AHEAD_SHOWN } from "../constants";
import type { DailyRow, Forecast, HourlyRow } from "../models/summary";
import { weatherState } from "./weather";

export function hourlyRows(forecast: Forecast): HourlyRow[] {
    return forecast.hours.flatMap((at, index) => {
        const temperature = forecast.variables.temperature_2m[index];
        const lower = forecast.band.lower[index];
        const upper = forecast.band.upper[index];
        const rain = forecast.variables.rain_probability[index];
        const amount = forecast.variables.rain_amount[index];
        const cloud = forecast.variables.cloud_cover[index];
        const wind = forecast.variables.wind_speed_10m[index];
        const humidity = forecast.variables.relative_humidity_2m[index];

        if (temperature === undefined || lower === undefined || upper === undefined || rain === undefined
            || amount === undefined || cloud === undefined || wind === undefined || humidity === undefined) {
            return [];
        }

        return [{ at, temperature, lower, upper, rain, amount, cloud, wind, humidity }];
    });
}

export function upcomingRows(rows: HourlyRow[], now: Date): HourlyRow[] {
    const current = currentRow(rows, now);
    const from = current === undefined ? 0 : rows.indexOf(current);
    return rows.slice(from, from + HOURS_AHEAD_SHOWN);
}

function mean(values: number[]): number {
    return values.reduce((total, value) => total + value, 0) / values.length;
}

function dayOf(row: HourlyRow): string {
    return new Date(row.at).toDateString();
}

export function dailyRows(rows: HourlyRow[]): DailyRow[] {
    return [...new Set(rows.map(dayOf))].map(day => {
        const hours = rows.filter(row => dayOf(row) === day);
        const temperatures = hours.map(hour => hour.temperature);
        return {
            at: hours[0]?.at ?? "",
            high: Math.max(...temperatures),
            low: Math.min(...temperatures),
            rain: Math.max(...hours.map(hour => hour.rain)),
            state: weatherState({
                rain: mean(hours.map(hour => hour.rain)),
                amount: mean(hours.map(hour => hour.amount)),
                cloud: mean(hours.map(hour => hour.cloud)),
                temperature: mean(temperatures)
            })
        };
    });
}

export function hoursOfDay(rows: HourlyRow[], at: string): HourlyRow[] {
    const day = new Date(at).toDateString();
    return rows.filter(row => dayOf(row) === day);
}

export function currentRow(rows: HourlyRow[], now: Date): HourlyRow | undefined {
    const passed = rows.filter(row => new Date(row.at) <= now);
    return passed.at(-1) ?? rows[0];
}
