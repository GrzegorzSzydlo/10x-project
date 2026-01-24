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

/**
 * Creates a JSON response with proper headers
 * @param data - Data to serialize as JSON
 * @param status - HTTP status code (default: 200)
 * @returns Response object with JSON content type
 */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Creates an error response with JSON format
 * @param message - Error message to return
 * @param status - HTTP status code (default: 500)
 * @returns Response object with error in JSON format
 */
export function errorResponse(message: string, status = 500): Response {
  return jsonResponse({ error: message }, status);
}
