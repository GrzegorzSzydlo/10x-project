import { describe, it, expect } from "vitest";
import { cn } from "../utils";

// Example unit test for utility function
describe("utils", () => {
  describe("cn", () => {
    it("should merge class names correctly", () => {
      const result = cn("px-2 py-1", "bg-blue-500");
      expect(result).toBe("px-2 py-1 bg-blue-500");
    });

    it("should handle conditional class names", () => {
      const isActive = true;
      const result = cn("base-class", isActive && "active-class");
      expect(result).toBe("base-class active-class");
    });

    it("should merge conflicting Tailwind classes", () => {
      const result = cn("px-2", "px-4");
      expect(result).toBe("px-4");
    });
  });
});
