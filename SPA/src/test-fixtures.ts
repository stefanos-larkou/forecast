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
        crossover: {
            temperature_2m: { "boosted": null, "ecmwf_ifs025 corrected": null, "ecmwf_ifs025 raw": 144, "gfs_seamless corrected": null, "gfs_seamless raw": null, "icon_seamless corrected": null, "icon_seamless raw": null },
            relative_humidity_2m: { "boosted": null, "ecmwf_ifs025 corrected": 120, "ecmwf_ifs025 raw": 24, "gfs_seamless corrected": 144, "gfs_seamless raw": 24, "icon_seamless corrected": 72, "icon_seamless raw": 24 },
            wind_speed_10m: { "boosted": null, "ecmwf_ifs025 corrected": 96, "ecmwf_ifs025 raw": 96, "gfs_seamless corrected": 24, "gfs_seamless raw": 24, "icon_seamless corrected": 120, "icon_seamless raw": 24 },
            cloud_cover: { "boosted": null, "ecmwf_ifs025 corrected": null, "ecmwf_ifs025 raw": null, "gfs_seamless corrected": 96, "gfs_seamless raw": 144, "icon_seamless corrected": 48, "icon_seamless raw": 96 }
        },
        coverage: {
            from: "2025-06",
            to: "2026-09",
            forecasts: 78912,
            level: 0.9,
            leads: [24, 48],
            inside: {
                temperature_2m: [0.7917, 0.7969],
                relative_humidity_2m: [0.8662, 0.8831],
                wind_speed_10m: [0.9051, 0.9018],
                cloud_cover: [0.8262, 0.8301]
            }
        },
        rain: {
            leads: [24, 48],
            wet_share: 0.0552,
            brier: {
                boosted: [0.0372, 0.0377],
                models: [0.035, 0.0369],
                climatology: [0.0493, 0.0492],
                persisted: [0.0825, 0.0884]
            },
            skill: {
                boosted: [0.2449, 0.2329],
                models: [0.2895, 0.2498],
                climatology: [0, 0],
                persisted: [-0.6744, -0.7977]
            },
            reliability: {
                boosted: [[0.0153, 0.0205, 69361], [0.4423, 0.4869, 995], [0.967, 0.7857, 42]],
                models: [[0, 0.0208, 73223], [0.3333, 0.2604, 4538], [1, 0.7178, 1017]]
            },
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
