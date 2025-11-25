/**
 * API Error logging helper
 * 
 * This helper provides centralized error logging for API endpoints.
 * Currently uses console.error as fallback, but can be extended to use
 * external monitoring services like Sentry or write to database error tables.
 */

export interface ApiError {
  endpoint: string;
  status: number;
  detail: string;
  correlationId?: string;
  userId?: string;
  timestamp?: string;
}

/**
 * Logs API errors with optional correlation ID for tracking
 * 
 * @param error - Error details to log
 */
export function logApiError(error: ApiError): void {
  const logEntry = {
    ...error,
    timestamp: error.timestamp || new Date().toISOString(),
    correlationId: error.correlationId || generateCorrelationId(),
  };

  // TODO: When error logging table is available, write to database
  // For now, fallback to console logging with structured format
  console.error("[API_ERROR]", JSON.stringify(logEntry, null, 2));
}

/**
 * Generates a simple correlation ID for error tracking
 */
function generateCorrelationId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}