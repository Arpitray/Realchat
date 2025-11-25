import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import type { RoomMember } from "@prisma/client";

export async function DELETE(
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
      include: { members: true }
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if user is a member of the room
    const isMember = room.members.some((member: RoomMember) => member.userId === session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: "You are not a member of this room" }, { status: 403 });
    }

    // Delete the room (Cascade will handle messages, members, whiteboard)
    await prisma.room.delete({
      where: { id: roomId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
