export type QueryState<T> =
    | { status: "loading"; }
    | { status: "error", error: Error; }
    | { status: "success", data: T; };

export function loading<T>(): QueryState<T> {
    return { status: "loading" };
}

export function failed<T>(error: unknown): QueryState<T> {
    return { status: "error", error: error instanceof Error ? error : new Error(String(error)) };
}

export function succeeded<T>(data: T): QueryState<T> {
    return { status: "success", data };
}

export function isLoading<T>(state: QueryState<T>): state is { status: "loading"; } {
    return state.status === "loading";
}

export function isError<T>(state: QueryState<T>): state is { status: "error", error: Error; } {
    return state.status === "error";
}

export function isSuccess<T>(state: QueryState<T>): state is { status: "success", data: T; } {
    return state.status === "success";
}
