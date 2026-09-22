import { LOCALE } from "../constants";

const ERROR_DECIMALS = 2;

const DATE = new Intl.DateTimeFormat(LOCALE, { day: "2-digit", month: "2-digit", year: "numeric" });
const TIME = new Intl.DateTimeFormat(LOCALE, { hour: "2-digit", minute: "2-digit" });
const COUNT = new Intl.NumberFormat(LOCALE);
const ERROR = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: ERROR_DECIMALS, maximumFractionDigits: ERROR_DECIMALS });

export function formatDate(timestamp: string): string {
    return DATE.format(new Date(timestamp));
}

export function formatDateTime(timestamp: string): string {
    const date = new Date(timestamp);
    return `${DATE.format(date)} ${TIME.format(date)}`;
}

export function formatCount(count: number): string {
    return COUNT.format(count);
}

export function formatError(error: number): string {
    return ERROR.format(error);
}
