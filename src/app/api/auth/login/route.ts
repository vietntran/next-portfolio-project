// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { z } from "zod";
import logger from "@/lib/logger";
import crypto from "crypto";

const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, password } = result.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken: crypto.randomUUID(), // Generate unique token
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Create JWT token
    const token = sign(
      { userId: user.id, sessionId: session.id },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "30d" }
    );

    const response = NextResponse.json({ success: true });

    // Set HTTP-only cookie
    response.cookies.set("session-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    logger.info("User logged in successfully", { userId: user.id });
    return response;
  } catch (error) {
    logger.error("Login failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
