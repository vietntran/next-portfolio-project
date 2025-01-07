// src/app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { z } from "zod";
import logger from "@/lib/logger";
import { excludeFields } from "@/lib/objectUtils";

const prisma = new PrismaClient();

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    logger.info("User created successfully", { userId: user.id });

    const userWithoutPassword = excludeFields(user, ["password"]);
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    logger.error("Signup failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Error creating user" }, { status: 500 });
  }
}
