import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { roomId, content } = await req.json();

    // Ensure the room exists, or create it on the fly
    const message = await prisma.message.create({
      data: {
        content,
        room: {
          connectOrCreate: {
            where: { id: roomId },
            create: {
              id: roomId,
              name: `Chat Room ${roomId}`,
            },
          },
        },
        sender: {
          connect: { id: session.user.id },
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
    });

    await pusherServer.trigger(`room-${roomId}`, "new-message", message);

    return NextResponse.json(message);
  } catch (error: any) {
    console.error("Error in /api/chat/message:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
