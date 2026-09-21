export interface ModelVersion {
    version: string;
    trained_at: string;
    commit: string;
}

export interface LiveRecord {
    from: string;
    to: string;
    truth_until: string;
    snapshots: number;
    forecasts: number;
    predictions: number;
    intervals: number;
    graded: number;
}

export interface Summary {
    generated_at: string;
    location: string;
    model: ModelVersion;
    live: LiveRecord;
}
