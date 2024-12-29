// src/__tests__/app/api/users/route.test.ts
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/users/route";
import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset } from "jest-mock-extended";

// Mock PrismaClient
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(),
}));

// Mock logger
jest.mock("@/lib/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

describe("User API Routes", () => {
  const mockPrisma = mockDeep<PrismaClient>();
  const mockUsers = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    mockReset(mockPrisma);
    // Reset all mocks before each test
    jest.clearAllMocks();
    (PrismaClient as jest.Mock).mockImplementation(() => mockPrisma);
  });

  describe("GET /api/users", () => {
    it("should return all users successfully", async () => {
      // Arrange
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual(mockUsers);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });
    });

    it("should handle database errors gracefully", async () => {
      // Arrange
      const dbError = new Error("Database connection failed");
      mockPrisma.user.findMany.mockRejectedValue(dbError);

      // Act
      const response = await GET();
      const data = await response.json();

      // Assert
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
      const createdUser = {
        ...newUser,
        id: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.user.create.mockResolvedValue(createdUser);

      const request = new NextRequest("http://localhost:3000/api/users", {
        method: "POST",
        body: JSON.stringify(newUser),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual(createdUser);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: newUser,
      });
    });

    it("should handle creation errors gracefully", async () => {
      // Arrange
      const dbError = new Error("Unique constraint violation");
      mockPrisma.user.create.mockRejectedValue(dbError);

      const request = new NextRequest("http://localhost:3000/api/users", {
        method: "POST",
        body: JSON.stringify(newUser),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: "Error creating user" });
    });
  });
});

// src/__tests__/app/api/users/[id]/route.test.ts
import { GET as GetById, PUT } from "@/app/api/users/[id]/route";

describe("User ID Routes", () => {
  const mockPrisma = mockDeep<PrismaClient>();
  const mockUser = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockReset(mockPrisma);
    jest.clearAllMocks();
    (PrismaClient as jest.Mock).mockImplementation(() => mockPrisma);
  });

  describe("GET /api/users/[id]", () => {
    it("should return a user by ID successfully", async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const response = await GetById(
        new NextRequest("http://localhost:3000/api/users/1"),
        { params: { id: "1" } }
      );
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should return 404 for non-existent user", async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act
      const response = await GetById(
        new NextRequest("http://localhost:3000/api/users/999"),
        { params: { id: "999" } }
      );
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "User not found" });
    });

    it("should handle invalid ID format", async () => {
      // Act
      const response = await GetById(
        new NextRequest("http://localhost:3000/api/users/invalid"),
        { params: { id: "invalid" } }
      );
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "Invalid user ID format" });
    });
  });

  describe("PUT /api/users/[id]", () => {
    const updateData = {
      name: "Updated Name",
      email: "updated@example.com",
    };

    it("should update a user successfully", async () => {
      // Arrange
      const updatedUser = { ...mockUser, ...updateData, updatedAt: new Date() };
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const request = new NextRequest("http://localhost:3000/api/users/1", {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      // Act
      const response = await PUT(request, { params: { id: "1" } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual(updatedUser);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining(updateData),
      });
    });

    it("should validate request body", async () => {
      // Arrange
      const invalidData = {
        name: "123", // Invalid name with numbers
        email: "invalid-email", // Invalid email format
      };

      const request = new NextRequest("http://localhost:3000/api/users/1", {
        method: "PUT",
        body: JSON.stringify(invalidData),
      });

      // Act
      const response = await PUT(request, { params: { id: "1" } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid request body");
      expect(data.details).toBeDefined();
    });

    it("should handle non-existent user update", async () => {
      // Arrange
      mockPrisma.user.update.mockRejectedValue({
        code: "P2025",
        clientVersion: "5.7.1",
      });

      const request = new NextRequest("http://localhost:3000/api/users/999", {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      // Act
      const response = await PUT(request, { params: { id: "999" } });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "User not found" });
    });
  });
});
