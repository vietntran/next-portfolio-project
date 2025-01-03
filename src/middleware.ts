import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "./lib/token";

export default async function middleware(request: NextRequest) {
  // Public routes that don't need authentication
  if (request.nextUrl.pathname.startsWith("/login")) {
    return;
  }

  const token = request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await verifyJWT(token);
    return;
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
