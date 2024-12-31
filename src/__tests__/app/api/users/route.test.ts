import { prismaMock } from "../../../singleton";
import { GET, POST } from "@/app/api/users/route";
import { mockReset } from "jest-mock-extended";

// Mock PrismaClient
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => prismaMock),
}));

// Mock logger
jest.mock("@/lib/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

// Import the mocked logger
import logger from "@/lib/logger";
const mockedLogger = jest.mocked(logger);

describe("User API Routes", () => {
  beforeEach(() => {
    mockReset(prismaMock);
    jest.clearAllMocks();
  });

  describe("GET /api/users", () => {
    it("should return all users successfully", async () => {
      // Arrange
      const currentDate = new Date();
      const mockPrismaUsers = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          createdAt: currentDate,
          updatedAt: currentDate,
        },
      ];

      // What we expect after JSON serialization
      const expectedResponse = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          createdAt: currentDate.toISOString(),
          updatedAt: currentDate.toISOString(),
        },
      ];

      prismaMock.user.findMany.mockResolvedValue(mockPrismaUsers);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });
      expect(mockedLogger.error).not.toHaveBeenCalled();
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Users fetched successfully",
        { count: mockPrismaUsers.length }
      );
      expect(response.status).toBe(200);
      expect(data).toEqual(expectedResponse);
    });

    it("should handle database errors gracefully", async () => {
      // Arrange
      const dbError = new Error("Database connection failed");
      prismaMock.user.findMany.mockRejectedValue(dbError);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(prismaMock.user.findMany).toHaveBeenCalled();
      expect(mockedLogger.error).toHaveBeenCalledWith("Failed to fetch users", {
        error: "Database connection failed",
        stack: expect.any(String),
      });
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Error fetching users" });
    });
  });

  describe("POST /api/users", () => {
    const newUser = {
      name: "New User",
      email: "newuser@example.com",
    };

    it("should create a new user successfully", async () => {
      // Arrange
      const currentDate = new Date();

      // Mock what Prisma returns
      const mockPrismaCreatedUser = {
        ...newUser,
        id: 3,
        createdAt: currentDate,
        updatedAt: currentDate,
      };

      // What we expect in the response after JSON serialization
      const expectedResponse = {
        ...newUser,
        id: 3,
        createdAt: currentDate.toISOString(),
        updatedAt: currentDate.toISOString(),
      };

      prismaMock.user.create.mockResolvedValue(mockPrismaCreatedUser);

      const request = new Request("http://localhost:3000/api/users", {
        method: "POST",
        body: JSON.stringify(newUser),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: newUser,
      });
      expect(mockedLogger.error).not.toHaveBeenCalled();
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "User created successfully",
        {
          id: expectedResponse.id,
          email: newUser.email,
          name: newUser.name,
        }
      );
      expect(response.status).toBe(200);
      expect(data).toEqual(expectedResponse);
    });

    it("should handle creation errors gracefully", async () => {
      // Arrange
      const dbError = new Error("Unique constraint violation");
      prismaMock.user.create.mockRejectedValue(dbError);

      const request = new Request("http://localhost:3000/api/users", {
        method: "POST",
        body: JSON.stringify(newUser),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(prismaMock.user.create).toHaveBeenCalled();
      expect(mockedLogger.error).toHaveBeenCalledWith("Failed to create user", {
        error: "Unique constraint violation",
        stack: expect.any(String),
        name: newUser.name,
        email: newUser.email,
      });
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Error creating user" });
    });
  });
});
