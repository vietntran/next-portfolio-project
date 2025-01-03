import { NextRequest, NextResponse } from "next/server";
import middleware from "@/middleware";
import { verifyJWT } from "@/lib/token";

// Rest of the test code remains exactly the same as before
jest.mock("@/lib/token", () => ({
  verifyJWT: jest.fn(),
}));

describe("Authentication Middleware", () => {
  let mockRequest: NextRequest;
  let mockHeaders: Headers;

  beforeEach(() => {
    mockHeaders = new Headers();
    mockRequest = new NextRequest("http://localhost:3000", {
      headers: mockHeaders,
    });
    jest.clearAllMocks();
  });

  describe("Authentication Flow", () => {
    it("should allow access to public routes without authentication", async () => {
      mockRequest = new NextRequest("http://localhost:3000/login");
      const response = await middleware(mockRequest);
      expect(response).toBeUndefined();
    });

    it("should redirect to login for protected routes without token", async () => {
      mockRequest = new NextRequest("http://localhost:3000/dashboard");
      const response = await middleware(mockRequest);
      expect(response).toBeInstanceOf(NextResponse);
      expect(response?.status).toBe(302);
      expect(response?.headers.get("Location")).toBe("/login");
    });

    it("should allow access to protected routes with valid token", async () => {
      mockHeaders.set("Authorization", "Bearer valid.jwt.token");
      mockRequest = new NextRequest("http://localhost:3000/dashboard", {
        headers: mockHeaders,
      });
      (verifyJWT as jest.Mock).mockResolvedValueOnce({ userId: "123" });

      const response = await middleware(mockRequest);
      expect(response).toBeUndefined();
    });
  });

  describe("Token Validation", () => {
    it("should handle invalid JWT format", async () => {
      mockHeaders.set("Authorization", "InvalidToken");
      mockRequest = new NextRequest("http://localhost:3000/dashboard", {
        headers: mockHeaders,
      });

      const response = await middleware(mockRequest);
      expect(response?.status).toBe(302);
      expect(response?.headers.get("Location")).toBe("/login");
    });

    it("should handle expired tokens", async () => {
      mockHeaders.set("Authorization", "Bearer expired.token");
      mockRequest = new NextRequest("http://localhost:3000/dashboard", {
        headers: mockHeaders,
      });
      (verifyJWT as jest.Mock).mockRejectedValueOnce(
        new Error("Token expired")
      );

      const response = await middleware(mockRequest);
      expect(response?.status).toBe(302);
      expect(response?.headers.get("Location")).toBe("/login");
    });
  });

  describe("Redirect Behavior", () => {
    it("should preserve original URL in redirect query parameter", async () => {
      mockRequest = new NextRequest("http://localhost:3000/dashboard/settings");
      const response = await middleware(mockRequest);

      const redirectUrl = response?.headers.get("Location");
      expect(redirectUrl).toContain("/login?callbackUrl=");
      expect(redirectUrl).toContain(encodeURIComponent("/dashboard/settings"));
    });

    it("should handle redirect loops", async () => {
      mockRequest = new NextRequest(
        "http://localhost:3000/login?callbackUrl=/login"
      );
      const response = await middleware(mockRequest);

      expect(response?.headers.get("Location")).toBe("/dashboard");
    });
  });
});
