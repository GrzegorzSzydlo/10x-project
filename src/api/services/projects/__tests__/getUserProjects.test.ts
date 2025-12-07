import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../../db/database.types";
import { getUserProjects } from "../getUserProjects";

type ServiceSupabaseClient = SupabaseClient<Database>;

describe("getUserProjects", () => {
  let mockSupabase: ServiceSupabaseClient;
  const mockUserId = "user-123";

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = {
      from: vi.fn(),
    } as unknown as ServiceSupabaseClient;
  });

  describe("Successful scenarios", () => {
    it("should return empty array when user has no projects", async () => {
      const mockFrom = vi.mocked(mockSupabase.from);
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      } as unknown as ReturnType<ServiceSupabaseClient["from"]>);

      const result = await getUserProjects({
        userId: mockUserId,
        supabase: mockSupabase,
      });

      expect(result).toEqual([]);
      expect(mockFrom).toHaveBeenCalledWith("project_members");
    });

    it("should return single project when user is member of one project", async () => {
      const mockProject = {
        id: "project-1",
        name: "Test Project",
        owner_id: "owner-1",
        created_at: "2024-01-01T00:00:00Z",
      };

      const mockFrom = vi.mocked(mockSupabase.from);
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ project: mockProject }],
            error: null,
          }),
        }),
      } as unknown as ReturnType<ServiceSupabaseClient["from"]>);

      const result = await getUserProjects({
        userId: mockUserId,
        supabase: mockSupabase,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockProject);
    });

    it("should return multiple projects when user is member of multiple projects", async () => {
      const mockProjects = [
        {
          id: "project-1",
          name: "Project Alpha",
          owner_id: "owner-1",
          created_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "project-2",
          name: "Project Beta",
          owner_id: "owner-2",
          created_at: "2024-01-02T00:00:00Z",
        },
        {
          id: "project-3",
          name: "Project Gamma",
          owner_id: "owner-1",
          created_at: "2024-01-03T00:00:00Z",
        },
      ];

      const mockFrom = vi.mocked(mockSupabase.from);
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockProjects.map((project) => ({ project })),
            error: null,
          }),
        }),
      } as unknown as ReturnType<ServiceSupabaseClient["from"]>);

      const result = await getUserProjects({
        userId: mockUserId,
        supabase: mockSupabase,
      });

      expect(result).toHaveLength(3);
      expect(result.map((p) => p.id)).toEqual(["project-3", "project-2", "project-1"]);
    });

    it("should sort projects by creation date (newest first)", async () => {
      const mockProjects = [
        {
          id: "project-old",
          name: "Old Project",
          owner_id: "owner-1",
          created_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "project-newest",
          name: "Newest Project",
          owner_id: "owner-1",
          created_at: "2024-12-01T00:00:00Z",
        },
        {
          id: "project-middle",
          name: "Middle Project",
          owner_id: "owner-1",
          created_at: "2024-06-01T00:00:00Z",
        },
      ];

      const mockFrom = vi.mocked(mockSupabase.from);
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockProjects.map((project) => ({ project })),
            error: null,
          }),
        }),
      } as unknown as ReturnType<ServiceSupabaseClient["from"]>);

      const result = await getUserProjects({
        userId: mockUserId,
        supabase: mockSupabase,
      });

      expect(result[0].id).toBe("project-newest");
      expect(result[1].id).toBe("project-middle");
      expect(result[2].id).toBe("project-old");
    });

    it("should filter out null projects", async () => {
      const mockData = [
        {
          project: {
            id: "project-1",
            name: "Valid Project",
            owner_id: "owner-1",
            created_at: "2024-01-01T00:00:00Z",
          },
        },
        { project: null },
        {
          project: {
            id: "project-2",
            name: "Another Valid Project",
            owner_id: "owner-2",
            created_at: "2024-01-02T00:00:00Z",
          },
        },
      ];

      const mockFrom = vi.mocked(mockSupabase.from);
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockData,
            error: null,
          }),
        }),
      } as unknown as ReturnType<ServiceSupabaseClient["from"]>);

      const result = await getUserProjects({
        userId: mockUserId,
        supabase: mockSupabase,
      });

      expect(result).toHaveLength(2);
      expect(result.every((p) => p !== null)).toBe(true);
    });

    it("should call Supabase with correct parameters", async () => {
      const mockFrom = vi.mocked(mockSupabase.from);
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      mockFrom.mockReturnValue({
        select: mockSelect,
      } as unknown as ReturnType<ServiceSupabaseClient["from"]>);

      await getUserProjects({
        userId: mockUserId,
        supabase: mockSupabase,
      });

      expect(mockFrom).toHaveBeenCalledWith("project_members");
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining("project:projects"));
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining("id"));
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining("name"));
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining("owner_id"));
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining("created_at"));
    });

    it("should return only required ProjectDto fields", async () => {
      const mockProject = {
        id: "project-1",
        name: "Test Project",
        owner_id: "owner-1",
        created_at: "2024-01-01T00:00:00Z",
        // Extra fields that should not be in ProjectDto
        updated_at: "2024-01-02T00:00:00Z",
        description: "Some description",
      };

      const mockFrom = vi.mocked(mockSupabase.from);
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ project: mockProject }],
            error: null,
          }),
        }),
      } as unknown as ReturnType<ServiceSupabaseClient["from"]>);

      const result = await getUserProjects({
        userId: mockUserId,
        supabase: mockSupabase,
      });

      expect(result[0]).toEqual({
        id: "project-1",
        name: "Test Project",
        owner_id: "owner-1",
        created_at: "2024-01-01T00:00:00Z",
      });
      expect(Object.keys(result[0])).toEqual(["id", "name", "owner_id", "created_at"]);
    });
  });

  describe("Error scenarios", () => {
    it("should throw error when database query fails", async () => {
      const mockFrom = vi.mocked(mockSupabase.from);
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Database connection error" },
          }),
        }),
      } as unknown as ReturnType<ServiceSupabaseClient["from"]>);

      await expect(
        getUserProjects({
          userId: mockUserId,
          supabase: mockSupabase,
        })
      ).rejects.toThrow("Failed to fetch user projects: Database connection error");
    });

    it("should throw error with detailed message on query failure", async () => {
      const mockFrom = vi.mocked(mockSupabase.from);
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Permission denied" },
          }),
        }),
      } as unknown as ReturnType<ServiceSupabaseClient["from"]>);

      await expect(
        getUserProjects({
          userId: mockUserId,
          supabase: mockSupabase,
        })
      ).rejects.toThrow("Failed to fetch user projects: Permission denied");
    });

    it("should throw error when query returns error with no data", async () => {
      const mockFrom = vi.mocked(mockSupabase.from);
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Table not found" },
          }),
        }),
      } as unknown as ReturnType<ServiceSupabaseClient["from"]>);

      await expect(
        getUserProjects({
          userId: mockUserId,
          supabase: mockSupabase,
        })
      ).rejects.toThrow("Table not found");
    });
  });

  describe("Edge cases", () => {
    it("should handle projects with same creation timestamp", async () => {
      const sameTimestamp = "2024-01-01T12:00:00Z";
      const mockProjects = [
        {
          id: "project-1",
          name: "Project A",
          owner_id: "owner-1",
          created_at: sameTimestamp,
        },
        {
          id: "project-2",
          name: "Project B",
          owner_id: "owner-1",
          created_at: sameTimestamp,
        },
      ];

      const mockFrom = vi.mocked(mockSupabase.from);
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: mockProjects.map((project) => ({ project })),
            error: null,
          }),
        }),
      } as unknown as ReturnType<ServiceSupabaseClient["from"]>);

      const result = await getUserProjects({
        userId: mockUserId,
        supabase: mockSupabase,
      });

      expect(result).toHaveLength(2);
      // Both should be present regardless of order
      expect(result.map((p) => p.id).sort()).toEqual(["project-1", "project-2"]);
    });

    it("should handle empty userId", async () => {
      const mockFrom = vi.mocked(mockSupabase.from);
      const mockEq = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      } as unknown as ReturnType<ServiceSupabaseClient["from"]>);

      await getUserProjects({
        userId: "",
        supabase: mockSupabase,
      });

      expect(mockEq).toHaveBeenCalledWith("user_id", "");
    });

    it("should handle projects with special characters in names", async () => {
      const mockProject = {
        id: "project-1",
        name: "Test & <Project> \"Special\" 'Chars'",
        owner_id: "owner-1",
        created_at: "2024-01-01T00:00:00Z",
      };

      const mockFrom = vi.mocked(mockSupabase.from);
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ project: mockProject }],
            error: null,
          }),
        }),
      } as unknown as ReturnType<ServiceSupabaseClient["from"]>);

      const result = await getUserProjects({
        userId: mockUserId,
        supabase: mockSupabase,
      });

      expect(result[0].name).toBe("Test & <Project> \"Special\" 'Chars'");
    });

    it("should handle very long project names", async () => {
      const longName = "A".repeat(120);
      const mockProject = {
        id: "project-1",
        name: longName,
        owner_id: "owner-1",
        created_at: "2024-01-01T00:00:00Z",
      };

      const mockFrom = vi.mocked(mockSupabase.from);
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ project: mockProject }],
            error: null,
          }),
        }),
      } as unknown as ReturnType<ServiceSupabaseClient["from"]>);

      const result = await getUserProjects({
        userId: mockUserId,
        supabase: mockSupabase,
      });

      expect(result[0].name).toBe(longName);
      expect(result[0].name.length).toBe(120);
    });
  });
});
