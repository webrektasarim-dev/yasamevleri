import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  return NextResponse.json({
    session,
    role: (session?.user as any)?.role,
    isAdmin: (session?.user as any)?.role === "admin",
  });
}




