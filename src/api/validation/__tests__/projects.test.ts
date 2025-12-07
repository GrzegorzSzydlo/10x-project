import { describe, it, expect } from "vitest";
import { createProjectSchema } from "../projects";

describe("createProjectSchema", () => {
  describe("Valid inputs", () => {
    it("should accept valid project name", () => {
      const result = createProjectSchema.safeParse({ name: "My Project" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("My Project");
      }
    });

    it("should accept name with exactly 3 characters", () => {
      const result = createProjectSchema.safeParse({ name: "ABC" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("ABC");
      }
    });

    it("should accept name with exactly 120 characters", () => {
      const longName = "A".repeat(120);
      const result = createProjectSchema.safeParse({ name: longName });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe(longName);
      }
    });

    it("should accept name with special characters", () => {
      const result = createProjectSchema.safeParse({ name: "Project-2024_v1.0" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Project-2024_v1.0");
      }
    });

    it("should accept name with unicode characters", () => {
      const result = createProjectSchema.safeParse({ name: "Projekt Świąteczny 🎄" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Projekt Świąteczny 🎄");
      }
    });

    it("should accept name with numbers", () => {
      const result = createProjectSchema.safeParse({ name: "Project 2024" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Project 2024");
      }
    });
  });

  describe("Whitespace handling and normalization", () => {
    it("should trim leading whitespace", () => {
      const result = createProjectSchema.safeParse({ name: "   My Project" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("My Project");
      }
    });

    it("should trim trailing whitespace", () => {
      const result = createProjectSchema.safeParse({ name: "My Project   " });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("My Project");
      }
    });

    it("should trim both leading and trailing whitespace", () => {
      const result = createProjectSchema.safeParse({ name: "   My Project   " });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("My Project");
      }
    });

    it("should normalize multiple spaces to single space", () => {
      const result = createProjectSchema.safeParse({ name: "My    Project    Name" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("My Project Name");
      }
    });

    it("should normalize tabs and newlines to single space", () => {
      const result = createProjectSchema.safeParse({ name: "My\t\tProject\n\nName" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("My Project Name");
      }
    });

    it("should handle complex whitespace normalization", () => {
      const result = createProjectSchema.safeParse({ name: "  My   \t  Project  \n Name  " });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("My Project Name");
      }
    });
  });

  describe("Validation failures - Too short", () => {
    it("should reject empty string", () => {
      const result = createProjectSchema.safeParse({ name: "" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 3 characters");
      }
    });

    it("should reject string with only whitespace", () => {
      const result = createProjectSchema.safeParse({ name: "   " });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 3 characters");
      }
    });

    it("should reject name with 1 character", () => {
      const result = createProjectSchema.safeParse({ name: "A" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 3 characters");
      }
    });

    it("should reject name with 2 characters", () => {
      const result = createProjectSchema.safeParse({ name: "AB" });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 3 characters");
      }
    });

    it("should reject name that becomes too short after trimming", () => {
      const result = createProjectSchema.safeParse({ name: "  A  " });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 3 characters");
      }
    });
  });

  describe("Validation failures - Too long", () => {
    it("should reject name with 121 characters", () => {
      const longName = "A".repeat(121);
      const result = createProjectSchema.safeParse({ name: longName });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("no longer than 120 characters");
      }
    });

    it("should reject name with 150 characters", () => {
      const longName = "A".repeat(150);
      const result = createProjectSchema.safeParse({ name: longName });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("no longer than 120 characters");
      }
    });

    it("should reject very long name (500 characters)", () => {
      const longName = "A".repeat(500);
      const result = createProjectSchema.safeParse({ name: longName });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("no longer than 120 characters");
      }
    });
  });

  describe("Type validation", () => {
    it("should reject null", () => {
      const result = createProjectSchema.safeParse({ name: null });

      expect(result.success).toBe(false);
    });

    it("should reject undefined", () => {
      const result = createProjectSchema.safeParse({ name: undefined });

      expect(result.success).toBe(false);
    });

    it("should reject number", () => {
      const result = createProjectSchema.safeParse({ name: 123 });

      expect(result.success).toBe(false);
    });

    it("should reject object", () => {
      const result = createProjectSchema.safeParse({ name: { value: "test" } });

      expect(result.success).toBe(false);
    });

    it("should reject array", () => {
      const result = createProjectSchema.safeParse({ name: ["test"] });

      expect(result.success).toBe(false);
    });

    it("should reject boolean", () => {
      const result = createProjectSchema.safeParse({ name: true });

      expect(result.success).toBe(false);
    });
  });

  describe("Missing field", () => {
    it("should reject empty object", () => {
      const result = createProjectSchema.safeParse({});

      expect(result.success).toBe(false);
    });

    it("should reject object with wrong field name", () => {
      const result = createProjectSchema.safeParse({ projectName: "My Project" });

      expect(result.success).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("should handle name with only emojis", () => {
      const result = createProjectSchema.safeParse({ name: "🎄🎅🎁" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("🎄🎅🎁");
      }
    });

    it("should handle mixed languages", () => {
      const result = createProjectSchema.safeParse({ name: "Project プロジェクト 项目" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Project プロジェクト 项目");
      }
    });

    it("should handle name with punctuation", () => {
      const result = createProjectSchema.safeParse({ name: "Hello, World! (2024)" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Hello, World! (2024)");
      }
    });

    it("should preserve single spaces between words", () => {
      const result = createProjectSchema.safeParse({ name: "My New Project" });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("My New Project");
      }
    });
  });
});
