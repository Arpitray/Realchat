import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    // Validate input early to avoid passing `undefined` to Prisma
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Password is required (min 6 chars)" }, { status: 400 });
    }

    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record || record.used) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    if (new Date(record.expires) < new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: record.userId },
      data: {
        password: hashed,
      },
    });

    await prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    });

    return NextResponse.json({ message: "Password updated" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
