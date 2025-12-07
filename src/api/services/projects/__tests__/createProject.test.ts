import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClientType } from "../createProject";
import { createProject } from "../createProject";

// Example unit test for API service
describe("createProject", () => {
  let mockSupabase: SupabaseClientType;
  const mockOwnerId = "user-123";

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Create mock Supabase client
    mockSupabase = {
      from: vi.fn(),
    } as unknown as SupabaseClientType;
  });

  it("should create a project successfully", async () => {
    const projectData = {
      id: "project-123",
      name: "Test Project",
      owner_id: mockOwnerId,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    // Mock successful project creation and member addition
    const mockFrom = vi.mocked(mockSupabase.from);
    mockFrom
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: projectData,
              error: null,
            }),
          }),
        }),
      } as unknown as ReturnType<SupabaseClientType["from"]>)
      .mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({
          data: { project_id: projectData.id, user_id: mockOwnerId },
          error: null,
        }),
      } as unknown as ReturnType<SupabaseClientType["from"]>);

    const command = { name: "Test Project" };
    const context = {
      ownerId: mockOwnerId,
      supabase: mockSupabase,
    };

    const result = await createProject(command, context);

    expect(result).toEqual(projectData);
    expect(result.name).toBe("Test Project");
    expect(result.owner_id).toBe(mockOwnerId);
  });

  it("should handle project creation errors", async () => {
    // Mock failed project creation
    const mockFrom = vi.mocked(mockSupabase.from);
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Database error" },
          }),
        }),
      }),
    } as unknown as ReturnType<SupabaseClientType["from"]>);

    const command = { name: "Test Project" };
    const context = {
      ownerId: mockOwnerId,
      supabase: mockSupabase,
    };

    await expect(createProject(command, context)).rejects.toThrow("Failed to create project: Database error");
  });

  it("should handle member addition errors", async () => {
    const projectData = {
      id: "project-123",
      name: "Test Project",
      owner_id: mockOwnerId,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    };

    // Create spy functions that will be called in sequence
    const mockEq = vi.fn().mockResolvedValue({ data: null, error: null });
    const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
    const mockInsertMember = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Failed to add member" },
    });
    const mockSingle = vi.fn().mockResolvedValue({
      data: projectData,
      error: null,
    });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsertProject = vi.fn().mockReturnValue({ select: mockSelect });

    // Create a mock that tracks call count
    let fromCallCount = 0;
    const testMockSupabase = {
      from: vi.fn(() => {
        fromCallCount++;
        if (fromCallCount === 1) {
          // First call: projects table for insert
          return { insert: mockInsertProject };
        } else if (fromCallCount === 2) {
          // Second call: project_members table for insert
          return { insert: mockInsertMember };
        } else {
          // Third call: projects table for delete (rollback)
          return { delete: mockDelete };
        }
      }),
    } as unknown as SupabaseClientType;

    const command = { name: "Test Project" };
    const context = {
      ownerId: mockOwnerId,
      supabase: testMockSupabase,
    };

    // Should throw error when member addition fails
    await expect(createProject(command, context)).rejects.toThrow("Failed to add project member");

    // Verify that rollback was attempted
    // Note: from() is called 4 times because the catch block also tries to delete
    expect(testMockSupabase.from).toHaveBeenCalled();
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("id", projectData.id);
  });
});
