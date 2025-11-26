import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import { encrypt } from "@/lib/encryption";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId, content } = await req.json();

    // 🔐 Encrypt content before saving
    const cipherText = content ? encrypt(content) : null;

    const message = await prisma.message.create({
      data: {
        // ⬇️ store ENCRYPTED text in DB
        content: cipherText,
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

    // 👇 Build payload for clients:
    //    same message, but with PLAINTEXT content
    const payload = {
      ...message,
      content, // override encrypted content with original plain text
    };

    // 📡 Broadcast plaintext to clients
    await pusherServer.trigger(`room-${roomId}`, "new-message", payload);

    // 🔁 Return plaintext to caller too
    return NextResponse.json(payload);
  } catch (error: any) {
    console.error("Error in /api/chat/message:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
