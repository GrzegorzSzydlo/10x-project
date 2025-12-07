import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logApiError } from "../logApiError";
import type { ApiError } from "../logApiError";

describe("logApiError", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Spy on console.error to verify logging behavior
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {
      // noop - suppress console output in tests
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("Basic logging functionality", () => {
    it("should log error with all required fields", () => {
      const error: ApiError = {
        endpoint: "POST /api/projects",
        status: 400,
        detail: "Validation failed",
      };

      logApiError(error);

      expect(consoleErrorSpy).toHaveBeenCalledOnce();
      expect(consoleErrorSpy).toHaveBeenCalledWith("[API_ERROR]", expect.stringContaining("POST /api/projects"));
      expect(consoleErrorSpy).toHaveBeenCalledWith("[API_ERROR]", expect.stringContaining("400"));
      expect(consoleErrorSpy).toHaveBeenCalledWith("[API_ERROR]", expect.stringContaining("Validation failed"));
    });

    it("should log error with optional correlationId", () => {
      const error: ApiError = {
        endpoint: "GET /api/projects",
        status: 500,
        detail: "Database error",
        correlationId: "req_123_abc456",
      };

      logApiError(error);

      expect(consoleErrorSpy).toHaveBeenCalledOnce();
      expect(consoleErrorSpy).toHaveBeenCalledWith("[API_ERROR]", expect.stringContaining("req_123_abc456"));
    });

    it("should log error with optional userId", () => {
      const error: ApiError = {
        endpoint: "DELETE /api/projects/123",
        status: 403,
        detail: "Insufficient permissions",
        userId: "user-789",
      };

      logApiError(error);

      expect(consoleErrorSpy).toHaveBeenCalledOnce();
      expect(consoleErrorSpy).toHaveBeenCalledWith("[API_ERROR]", expect.stringContaining("user-789"));
    });

    it("should log error with all optional fields", () => {
      const error: ApiError = {
        endpoint: "PATCH /api/projects/456",
        status: 404,
        detail: "Project not found",
        correlationId: "req_456_xyz789",
        userId: "user-123",
        timestamp: "2024-12-07T12:00:00Z",
      };

      logApiError(error);

      expect(consoleErrorSpy).toHaveBeenCalledOnce();
      const loggedMessage = consoleErrorSpy.mock.calls[0][1] as string;
      const parsedLog = JSON.parse(loggedMessage);

      expect(parsedLog).toMatchObject({
        endpoint: "PATCH /api/projects/456",
        status: 404,
        detail: "Project not found",
        correlationId: "req_456_xyz789",
        userId: "user-123",
        timestamp: "2024-12-07T12:00:00Z",
      });
    });
  });

  describe("Auto-generated fields", () => {
    it("should generate correlationId if not provided", () => {
      const error: ApiError = {
        endpoint: "POST /api/tasks",
        status: 500,
        detail: "Internal error",
      };

      logApiError(error);

      const loggedMessage = consoleErrorSpy.mock.calls[0][1] as string;
      const parsedLog = JSON.parse(loggedMessage);

      expect(parsedLog.correlationId).toBeDefined();
      expect(parsedLog.correlationId).toMatch(/^err_\d+_[a-z0-9]+$/);
    });

    it("should add timestamp if not provided", () => {
      const error: ApiError = {
        endpoint: "GET /api/users",
        status: 401,
        detail: "Unauthorized",
      };

      logApiError(error);

      const loggedMessage = consoleErrorSpy.mock.calls[0][1] as string;
      const parsedLog = JSON.parse(loggedMessage);

      expect(parsedLog.timestamp).toBeDefined();
      expect(parsedLog.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("should preserve provided timestamp", () => {
      const customTimestamp = "2024-01-01T10:00:00.000Z";
      const error: ApiError = {
        endpoint: "PUT /api/settings",
        status: 400,
        detail: "Invalid settings",
        timestamp: customTimestamp,
      };

      logApiError(error);

      const loggedMessage = consoleErrorSpy.mock.calls[0][1] as string;
      const parsedLog = JSON.parse(loggedMessage);

      expect(parsedLog.timestamp).toBe(customTimestamp);
    });

    it("should preserve provided correlationId", () => {
      const customCorrelationId = "custom_correlation_123";
      const error: ApiError = {
        endpoint: "DELETE /api/items/1",
        status: 404,
        detail: "Item not found",
        correlationId: customCorrelationId,
      };

      logApiError(error);

      const loggedMessage = consoleErrorSpy.mock.calls[0][1] as string;
      const parsedLog = JSON.parse(loggedMessage);

      expect(parsedLog.correlationId).toBe(customCorrelationId);
    });

    it("should generate unique correlationIds for multiple calls", () => {
      const error: ApiError = {
        endpoint: "POST /api/test",
        status: 500,
        detail: "Test error",
      };

      logApiError(error);
      logApiError(error);
      logApiError(error);

      const correlationIds = consoleErrorSpy.mock.calls.map((call: unknown[]) => {
        const parsedLog = JSON.parse(call[1] as string);
        return parsedLog.correlationId;
      });

      const uniqueIds = new Set(correlationIds);
      expect(uniqueIds.size).toBe(3);
    });
  });

  describe("Log format validation", () => {
    it("should log as JSON string", () => {
      const error: ApiError = {
        endpoint: "GET /api/data",
        status: 500,
        detail: "Server error",
      };

      logApiError(error);

      const loggedMessage = consoleErrorSpy.mock.calls[0][1] as string;
      expect(() => JSON.parse(loggedMessage)).not.toThrow();
    });

    it("should format JSON with 2 space indentation", () => {
      const error: ApiError = {
        endpoint: "POST /api/create",
        status: 400,
        detail: "Bad request",
      };

      logApiError(error);

      const loggedMessage = consoleErrorSpy.mock.calls[0][1] as string;
      expect(loggedMessage).toContain("\n  ");
    });

    it("should prefix log with [API_ERROR]", () => {
      const error: ApiError = {
        endpoint: "PATCH /api/update",
        status: 422,
        detail: "Unprocessable entity",
      };

      logApiError(error);

      expect(consoleErrorSpy.mock.calls[0][0]).toBe("[API_ERROR]");
    });
  });

  describe("Edge cases and special characters", () => {
    it("should handle error detail with special characters", () => {
      const error: ApiError = {
        endpoint: "POST /api/projects",
        status: 400,
        detail: 'Invalid JSON: unexpected token "}" at position 45',
      };

      logApiError(error);

      const loggedMessage = consoleErrorSpy.mock.calls[0][1] as string;
      const parsedLog = JSON.parse(loggedMessage);

      expect(parsedLog.detail).toBe('Invalid JSON: unexpected token "}" at position 45');
    });

    it("should handle error detail with newlines", () => {
      const error: ApiError = {
        endpoint: "POST /api/validate",
        status: 400,
        detail: "Validation errors:\n- Name is required\n- Email is invalid",
      };

      logApiError(error);

      const loggedMessage = consoleErrorSpy.mock.calls[0][1] as string;
      const parsedLog = JSON.parse(loggedMessage);

      expect(parsedLog.detail).toBe("Validation errors:\n- Name is required\n- Email is invalid");
      expect(parsedLog.detail).toContain("\n");
    });

    it("should handle error detail with unicode characters", () => {
      const error: ApiError = {
        endpoint: "POST /api/data",
        status: 400,
        detail: "Błąd walidacji: Nieprawidłowa wartość 🚫",
      };

      logApiError(error);

      const loggedMessage = consoleErrorSpy.mock.calls[0][1] as string;
      const parsedLog = JSON.parse(loggedMessage);

      expect(parsedLog.detail).toBe("Błąd walidacji: Nieprawidłowa wartość 🚫");
    });

    it("should handle very long error details", () => {
      const longDetail = "Error: " + "x".repeat(1000);
      const error: ApiError = {
        endpoint: "GET /api/long-error",
        status: 500,
        detail: longDetail,
      };

      logApiError(error);

      const loggedMessage = consoleErrorSpy.mock.calls[0][1] as string;
      const parsedLog = JSON.parse(loggedMessage);

      expect(parsedLog.detail).toBe(longDetail);
      expect(parsedLog.detail.length).toBe(1007);
    });

    it("should handle endpoint with query parameters", () => {
      const error: ApiError = {
        endpoint: "GET /api/projects?page=1&limit=10&sort=name",
        status: 400,
        detail: "Invalid query parameters",
      };

      logApiError(error);

      const loggedMessage = consoleErrorSpy.mock.calls[0][1] as string;
      const parsedLog = JSON.parse(loggedMessage);

      expect(parsedLog.endpoint).toBe("GET /api/projects?page=1&limit=10&sort=name");
    });

    it("should handle empty userId", () => {
      const error: ApiError = {
        endpoint: "POST /api/anonymous",
        status: 401,
        detail: "Authentication required",
        userId: "",
      };

      logApiError(error);

      const loggedMessage = consoleErrorSpy.mock.calls[0][1] as string;
      const parsedLog = JSON.parse(loggedMessage);

      expect(parsedLog.userId).toBe("");
    });
  });

  describe("HTTP status codes", () => {
    it("should log 400 Bad Request errors", () => {
      const error: ApiError = {
        endpoint: "POST /api/test",
        status: 400,
        detail: "Bad request",
      };

      logApiError(error);

      const loggedMessage = consoleErrorSpy.mock.calls[0][1] as string;
      const parsedLog = JSON.parse(loggedMessage);

      expect(parsedLog.status).toBe(400);
    });

    it("should log 401 Unauthorized errors", () => {
      const error: ApiError = {
        endpoint: "GET /api/protected",
        status: 401,
        detail: "Unauthorized",
      };

      logApiError(error);

      const loggedMessage = consoleErrorSpy.mock.calls[0][1] as string;
      const parsedLog = JSON.parse(loggedMessage);

      expect(parsedLog.status).toBe(401);
    });

    it("should log 403 Forbidden errors", () => {
      const error: ApiError = {
        endpoint: "DELETE /api/admin",
        status: 403,
        detail: "Forbidden",
      };

      logApiError(error);

      const loggedMessage = consoleErrorSpy.mock.calls[0][1] as string;
      const parsedLog = JSON.parse(loggedMessage);

      expect(parsedLog.status).toBe(403);
    });

    it("should log 404 Not Found errors", () => {
      const error: ApiError = {
        endpoint: "GET /api/nonexistent",
        status: 404,
        detail: "Not found",
      };

      logApiError(error);

      const loggedMessage = consoleErrorSpy.mock.calls[0][1] as string;
      const parsedLog = JSON.parse(loggedMessage);

      expect(parsedLog.status).toBe(404);
    });

    it("should log 500 Internal Server Error", () => {
      const error: ApiError = {
        endpoint: "POST /api/crash",
        status: 500,
        detail: "Internal server error",
      };

      logApiError(error);

      const loggedMessage = consoleErrorSpy.mock.calls[0][1] as string;
      const parsedLog = JSON.parse(loggedMessage);

      expect(parsedLog.status).toBe(500);
    });
  });

  describe("Multiple consecutive calls", () => {
    it("should handle multiple errors logged in sequence", () => {
      const errors: ApiError[] = [
        { endpoint: "GET /api/1", status: 404, detail: "Not found" },
        { endpoint: "POST /api/2", status: 400, detail: "Bad request" },
        { endpoint: "PUT /api/3", status: 500, detail: "Server error" },
      ];

      errors.forEach((error) => logApiError(error));

      expect(consoleErrorSpy).toHaveBeenCalledTimes(3);

      const loggedEndpoints = consoleErrorSpy.mock.calls.map((call: unknown[]) => {
        const parsedLog = JSON.parse(call[1] as string);
        return parsedLog.endpoint;
      });

      expect(loggedEndpoints).toEqual(["GET /api/1", "POST /api/2", "PUT /api/3"]);
    });
  });
});
