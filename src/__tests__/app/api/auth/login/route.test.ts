// src/__tests__/app/api/auth/login/route.test.ts
import { NextResponse } from "next/server";
import { prismaMock } from "@/mocks/prisma";
import { POST } from "@/app/api/auth/login/route";
import { mockReset } from "jest-mock-extended";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

// Mock NextResponse
jest.mock("next/server", () => {
  const actualNext = jest.requireActual("next/server");
  class MockNextResponse extends actualNext.NextResponse {
    private cookieStore = new Map();

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      super(body, init);
    }

    get cookies() {
      return {
        set: (name: string, value: string, options: any = {}) => {
          this.cookieStore.set(name, { value, ...options });
          const cookieValue = `${name}=${value}; ${Object.entries(options)
            .map(([k, v]) => `${k}=${v}`)
            .join("; ")}`;
          this.headers.set("Set-Cookie", cookieValue);
        },
        get: (name: string) => {
          return this.cookieStore.get(name);
        },
        getAll: () => {
          return Array.from(this.cookieStore.entries()).map(
            ([name, { value }]) => ({ name, value })
          );
        },
      };
    }
  }

  return {
    ...actualNext,
    NextResponse: {
      ...actualNext.NextResponse,
      json: (body: any, init?: ResponseInit) => {
        return new MockNextResponse(JSON.stringify(body), {
          ...init,
          headers: {
            "content-type": "application/json",
            ...(init?.headers || {}),
          },
        });
      },
    },
  };
});

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => prismaMock),
}));

jest.mock("@/lib/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

import logger from "@/lib/logger";
const mockLogger = jest.mocked(logger);

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mock.jwt.token"),
}));

jest.mock("crypto", () => ({
  randomUUID: () => "mock-session-token",
}));

// Store original environment
const originalEnv = process.env;

beforeEach(() => {
  process.env = {
    ...originalEnv,
    NEXTAUTH_SECRET: "test-secret",
    NODE_ENV: "test",
  };
});

afterEach(() => {
  process.env = originalEnv;
  jest.clearAllMocks();
});

describe("Login API Route", () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    password: "hashed_password",
    name: "Test User",
    emailVerified: null,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSession = {
    id: "session-123",
    sessionToken: "mock-session-token",
    userId: "user-123",
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };

  describe("Input Validation", () => {
    it("should return 400 for invalid email", async () => {
      const request = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "invalid-email",
          password: "password123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid input");
    });

    it("should return 400 for missing password", async () => {
      const request = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid input");
    });
  });

  describe("Authentication", () => {
    it("should return 401 for non-existent user", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const request = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: "password123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Invalid credentials");
    });

    it("should return 401 for invalid password", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(false);

      const request = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: mockUser.email,
          password: "wrongpassword",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Invalid credentials");
    });

    it("should successfully authenticate valid credentials", async () => {
      // Mock successful user lookup
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      // Mock successful password comparison
      (compare as jest.Mock).mockResolvedValue(true);

      // Mock successful session creation
      prismaMock.session.create.mockResolvedValue(mockSession);

      // Mock JWT signing
      (sign as jest.Mock).mockReturnValue("mock.jwt.token");

      const request = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: mockUser.email,
          password: "correctpassword",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Verify response
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify cookie was set
      const cookies = response.headers.get("Set-Cookie");
      expect(cookies).toContain("session-token=mock.jwt.token");

      // Verify session was created
      expect(prismaMock.session.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          sessionToken: "mock-session-token",
          expires: expect.any(Date),
        },
      });

      // Verify JWT was signed
      expect(sign).toHaveBeenCalledWith(
        { userId: mockUser.id, sessionId: mockSession.id },
        "test-secret",
        { expiresIn: "30d" }
      );

      // Verify logging
      expect(mockLogger.info).toHaveBeenCalledWith(
        "User logged in successfully",
        { userId: mockUser.id }
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      prismaMock.user.findUnique.mockRejectedValue(new Error("Database error"));

      const request = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Authentication failed");
      expect(mockLogger.error).toHaveBeenCalledWith("Login failed", {
        error: "Database error",
      });
    });

    it("should handle session creation errors", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(true);
      prismaMock.session.create.mockRejectedValue(new Error("Session error"));

      const request = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: mockUser.email,
          password: "password123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Authentication failed");
      expect(mockLogger.error).toHaveBeenCalledWith("Login failed", {
        error: "Session error",
      });
    });
  });
});
