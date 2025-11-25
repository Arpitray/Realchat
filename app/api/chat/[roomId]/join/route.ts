import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if already a member
    const existingMember = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId: session.user.id,
        },
      },
    });

    if (!existingMember) {
      await prisma.roomMember.create({
        data: {
          roomId,
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json({ success: true, roomName: room.name });
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
