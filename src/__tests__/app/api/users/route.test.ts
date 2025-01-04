import { prismaMock } from "@/mocks/prisma";
import { GET, POST } from "@/app/api/users/route";
import { GET as GET_BY_ID, PUT } from "@/app/api/users/[id]/route";
import { mockReset } from "jest-mock-extended";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => prismaMock),
}));

jest.mock("@/lib/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

import logger from "@/lib/logger";
const mockedLogger = jest.mocked(logger);

describe("User API Routes", () => {
  beforeEach(() => {
    mockReset(prismaMock);
    jest.clearAllMocks();
  });

  describe("GET /api/users", () => {
    const userId = "clr1234567890";

    it("should return all users successfully", async () => {
      const currentDate = new Date();
      const mockPrismaUsers = [
        {
          id: userId,
          name: "John Doe",
          email: "john@example.com",
          emailVerified: null,
          password: null,
          image: null,
          createdAt: currentDate,
          updatedAt: currentDate,
        },
      ];

      prismaMock.user.findMany.mockResolvedValue(mockPrismaUsers);

      const response = await GET();
      const data = await response.json();

      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });
      expect(mockedLogger.error).not.toHaveBeenCalled();
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Users fetched successfully",
        { count: mockPrismaUsers.length }
      );
      expect(response.status).toBe(200);
      expect(data[0]).toEqual({
        ...mockPrismaUsers[0],
        createdAt: currentDate.toISOString(),
        updatedAt: currentDate.toISOString(),
      });
    });

    it("should handle database errors gracefully", async () => {
      const dbError = new Error("Database connection failed");
      prismaMock.user.findMany.mockRejectedValue(dbError);

      const response = await GET();
      const data = await response.json();

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
      const currentDate = new Date();
      const mockPrismaCreatedUser = {
        ...newUser,
        id: "clr9876543210",
        emailVerified: null,
        password: null,
        image: null,
        createdAt: currentDate,
        updatedAt: currentDate,
      };

      prismaMock.user.create.mockResolvedValue(mockPrismaCreatedUser);

      const request = new Request("http://localhost:3000/api/users", {
        method: "POST",
        body: JSON.stringify(newUser),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: newUser,
      });
      expect(mockedLogger.error).not.toHaveBeenCalled();
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "User created successfully",
        {
          id: mockPrismaCreatedUser.id,
          email: newUser.email,
          name: newUser.name,
        }
      );
      expect(response.status).toBe(200);
      expect(data).toEqual({
        ...mockPrismaCreatedUser,
        createdAt: currentDate.toISOString(),
        updatedAt: currentDate.toISOString(),
      });
    });

    it("should handle creation errors gracefully", async () => {
      const dbError = new Error("Unique constraint violation");
      prismaMock.user.create.mockRejectedValue(dbError);

      const request = new Request("http://localhost:3000/api/users", {
        method: "POST",
        body: JSON.stringify(newUser),
      });

      const response = await POST(request);
      const data = await response.json();

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

  describe("GET /api/users/[id]", () => {
    const userId = "clr1234567890";

    it("should return a user successfully", async () => {
      const currentDate = new Date();
      const mockUser = {
        id: userId,
        name: "John Doe",
        email: "john@example.com",
        emailVerified: null,
        password: null,
        image: null,
        createdAt: currentDate,
        updatedAt: currentDate,
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const response = await GET_BY_ID(new Request("http://localhost:3000"), {
        params: { id: userId },
      });

      const data = await response.json();

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(response.status).toBe(200);
      expect(data).toEqual({
        ...mockUser,
        createdAt: currentDate.toISOString(),
        updatedAt: currentDate.toISOString(),
      });
    });

    it("should return 404 for non-existent user", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const response = await GET_BY_ID(new Request("http://localhost:3000"), {
        params: { id: userId },
      });

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "User not found" });
    });
  });

  describe("PUT /api/users/[id]", () => {
    const userId = "clr1234567890";
    const updateData = {
      name: "Jane Doe",
      email: "jane@example.com",
    };

    it("should update user successfully", async () => {
      const currentDate = new Date();
      const mockUpdatedUser = {
        id: userId,
        ...updateData,
        emailVerified: null,
        password: null,
        image: null,
        createdAt: currentDate,
        updatedAt: currentDate,
      };

      prismaMock.user.update.mockResolvedValue(mockUpdatedUser);

      const response = await PUT(
        new Request("http://localhost:3000", {
          method: "PUT",
          body: JSON.stringify(updateData),
        }),
        { params: { id: userId } }
      );

      const data = await response.json();

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: expect.objectContaining({
          name: updateData.name,
          email: updateData.email,
          updatedAt: expect.any(Date),
        }),
      });
      expect(response.status).toBe(200);
      expect(data).toEqual({
        ...mockUpdatedUser,
        createdAt: currentDate.toISOString(),
        updatedAt: currentDate.toISOString(),
      });
    });

    it("should return 404 for non-existent user", async () => {
      const prismaError = new PrismaClientKnownRequestError("User not found", {
        code: "P2025",
        clientVersion: "5.7.1",
      });
      prismaMock.user.update.mockRejectedValue(prismaError);

      const response = await PUT(
        new Request("http://localhost:3000", {
          method: "PUT",
          body: JSON.stringify(updateData),
        }),
        { params: { id: userId } }
      );

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: "User not found" });
    });

    it("should validate request body", async () => {
      const invalidData = {
        name: "123",
        email: "invalid-email",
      };

      const response = await PUT(
        new Request("http://localhost:3000", {
          method: "PUT",
          body: JSON.stringify(invalidData),
        }),
        { params: { id: userId } }
      );

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid request body");
      expect(data.details).toBeDefined();
    });
  });
});
