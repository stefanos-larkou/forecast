import type { Forecast, Summary } from "./core/models/summary";

export const FORECAST: Forecast = {
    run_time: "2026-09-22T17:00:00+00:00",
    hours: ["2026-09-22T18:00:00+00:00", "2026-09-22T19:00:00+00:00", "2026-09-22T20:00:00+00:00"],
    variables: {
        temperature_2m: [26.28, 25.41, 23.9],
        relative_humidity_2m: [68.17, 71.4, 74.02],
        wind_speed_10m: [7.26, 6.81, 5.4],
        cloud_cover: [9.77, 14.2, 21.06],
        rain_probability: [0.02, 0.05, 0.11],
        rain_amount: [0.0, 0.14, 0.62]
    },
    band: {
        variable: "temperature_2m",
        lower: [24.63, 23.8, 22.4],
        upper: [27.27, 26.9, 25.6]
    }
};

export const SUMMARY: Summary = {
    generated_at: "2026-09-21T12:00:00+00:00",
    location: "larnaca",
    coordinates: { latitude: 34.9221, longitude: 33.62794 },
    model: { version: "2026-09-20", trained_at: "2026-09-20T09:12:33+00:00", commit: "90f5ea2" },
    live: {
        from: "2026-09-17T12:00:00+00:00",
        to: "2026-09-21T12:00:00+00:00",
        truth_until: "2026-09-14T23:00:00+00:00",
        snapshots: 14,
        forecasts: 33000,
        predictions: 5400,
        intervals: 1152,
        graded: 0
    },
    forecast: FORECAST,
    backtest: {
        from: "2025-03",
        to: "2026-09",
        forecasts: 322096,
        leads: [24, 48],
        rain: {
            amount: {
                leads: [24, 48],
                wet_hours: 4443,
                typical_mm: 0.1,
                mae: { boosted: [0.3475, 0.35], typical: [0.3731, 0.3746], models: [0.4011, 0.3983] },
                skill: { boosted: [0.0686, 0.0656], typical: [0, 0], models: [-0.075, -0.0632] }
            }
        },
        metrics: {
            mae: {
                temperature_2m: {
                    "boosted": [0.72, 0.75],
                    "ecmwf_ifs025 raw": [1.22, 1.35],
                    "gfs_seamless raw": [0.9, 0.94],
                    "icon_seamless raw": [0.94, 0.96],
                    "climatology": [1.49, 1.49],
                    "persisted": [1.09, 1.49]
                },
                relative_humidity_2m: {
                    "boosted": [5.32, 5.34],
                    "ecmwf_ifs025 raw": [8.24, 8.49],
                    "gfs_seamless raw": [10.18, 9.99],
                    "icon_seamless raw": [8.15, 8.26],
                    "climatology": [8.11, 8.14],
                    "persisted": [7.76, 9.66]
                },
                wind_speed_10m: {
                    "boosted": [3.03, 3.13],
                    "ecmwf_ifs025 raw": [3.72, 3.88],
                    "gfs_seamless raw": [5.56, 5.7],
                    "icon_seamless raw": [4.1, 4.12],
                    "climatology": [4.06, 4.06],
                    "persisted": [4.75, 5.54]
                },
                cloud_cover: {
                    "boosted": [14.19, 15.53],
                    "ecmwf_ifs025 raw": [13.75, 15.56],
                    "gfs_seamless raw": [16.4, 17.13],
                    "icon_seamless raw": [17.71, 19.54],
                    "climatology": [20.51, 20.46],
                    "persisted": [22.05, 24.59]
                }
            }
        }
    }
};
