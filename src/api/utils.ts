import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type LogLevel = "log" | "error" | "warn" | "info";

/**
 * Development-only logging function
 * Wraps console methods with DEV check and disables eslint warning
 *
 * @param level - The console method to use (log, error, warn, info)
 * @param args - Arguments to pass to the console method
 *
 * @example
 * devLog("error", "Something went wrong:", error);
 * devLog("log", "Debug info:", data);
 * devLog("warn", "Deprecated feature used");
 */
export function devLog(level: LogLevel, ...args: unknown[]): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console[level](...args);
  }
}
