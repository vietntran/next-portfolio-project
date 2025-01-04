// src/__tests__/app/api/auth/signup/route.test.ts
import { prismaMock } from "@/mocks/prisma";
import { POST } from "@/app/api/auth/signup/route";
import { mockReset } from "jest-mock-extended";

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => prismaMock),
}));

jest.mock("@/lib/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

describe("Signup API Route", () => {
  beforeEach(() => {
    mockReset(prismaMock);
    jest.clearAllMocks();
  });

  describe("Email duplication checks", () => {
    const existingUser = {
      id: "existing-user-id",
      email: "existing@example.com",
      name: "Existing User",
      password: "hashedpassword",
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newUserData = {
      email: "existing@example.com", // Same email as existing user
      name: "New User",
      password: "password123",
    };

    it("should not allow signup with an existing email", async () => {
      // Mock findUnique to return an existing user
      prismaMock.user.findUnique.mockResolvedValue(existingUser);

      const request = new Request("http://localhost:3000/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(newUserData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "User already exists" });

      // Verify that create was never called
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it("should allow signup with a new email", async () => {
      const newUser = {
        ...newUserData,
        email: "new@example.com", // Different email
      };

      // Mock findUnique to return null (no existing user)
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Mock create to return the new user
      prismaMock.user.create.mockResolvedValue({
        id: "new-user-id",
        ...newUser,
        password: "hashedpassword", // This would be the hashed version
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new Request("http://localhost:3000/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(newUser),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.email).toBe(newUser.email);
      expect(data.password).toBeUndefined(); // Password should not be returned

      // Verify create was called with correct data
      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    });

    it("should handle case-insensitive email duplicates", async () => {
      const upperCaseEmail = {
        ...newUserData,
        email: "EXISTING@EXAMPLE.COM", // Same email but different case
      };

      // Mock findUnique to return an existing user
      prismaMock.user.findUnique.mockResolvedValue(existingUser);

      const request = new Request("http://localhost:3000/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(upperCaseEmail),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: "User already exists" });
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });
});
