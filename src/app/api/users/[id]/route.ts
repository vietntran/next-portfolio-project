import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import logger from "@/lib/logger";
import { z } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .trim()
    .regex(/^[a-zA-Z\s]+$/, "Name must contain only letters and spaces"),
  email: z
    .string()
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate and parse the ID parameter
    const parsedId = parseInt(params.id);
    if (isNaN(parsedId)) {
      logger.warn("Invalid user ID format", { userId: params.id });
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const result = updateUserSchema.safeParse(body);

    if (!result.success) {
      logger.warn("Invalid request body", {
        userId: parsedId,
        body,
        errors: result.error.issues,
      });
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: result.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, email } = result.data;

    const user = await prisma.user.update({
      where: { id: parsedId }, // Now using the parsed integer ID
      data: {
        name,
        email,
        updatedAt: new Date(),
      },
    });

    logger.info("User updated successfully", {
      userId: parsedId,
      updatedFields: { name, email },
    });

    return NextResponse.json(user);
  } catch (error) {
    logger.error("Failed to update user", {
      userId: params.id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Error updating user" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate and parse the ID parameter
    const parsedId = parseInt(params.id);
    if (isNaN(parsedId)) {
      logger.warn("Invalid user ID format", { userId: params.id });
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parsedId }, // Using parsed integer ID
    });

    if (!user) {
      logger.warn("User not found", { userId: parsedId });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    logger.info("User fetched successfully", { userId: parsedId });
    return NextResponse.json(user);
  } catch (error) {
    logger.error("Failed to fetch user", {
      userId: params.id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ error: "Error fetching user" }, { status: 500 });
  }
}