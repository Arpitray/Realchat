import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Room name is required" }, { status: 400 });
    }

    const room = await prisma.room.create({
      data: {
        name,
        members: {
          create: {
            userId: session.user.id,
          },
        },
      },
    });

    return NextResponse.json(room);
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
