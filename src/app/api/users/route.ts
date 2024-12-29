// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import logger from "@/lib/logger";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    logger.info("Users fetched successfully", { count: users.length });
    return NextResponse.json(users);
  } catch (error) {
    logger.error("Failed to fetch users", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Error fetching users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { name, email } = await request.json();
  try {
    const user = await prisma.user.create({
      data: { name, email },
    });
    const { id } = user;
    logger.info(`User created successfully`, { id, email, name });
    return NextResponse.json(user);
  } catch (error) {
    logger.error("Failed to create user", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name,
      email,
    });
    return NextResponse.json({ error: "Error creating user" }, { status: 500 });
  }
}
