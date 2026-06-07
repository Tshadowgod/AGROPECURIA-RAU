import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  return NextResponse.json({
    status: "ok",
    db: dbUrl ? `set (${dbUrl.substring(0, 30)}...)` : "NOT SET",
    nextauth_secret: process.env.NEXTAUTH_SECRET ? "set" : "NOT SET",
    nextauth_url: process.env.NEXTAUTH_URL || "NOT SET",
    node_env: process.env.NODE_ENV,
  });
}
