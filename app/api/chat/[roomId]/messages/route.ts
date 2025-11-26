import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Message } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { decrypt } from "@/lib/encryption"; // 👈 add this

export async function GET(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = await params;

    const rawMessages = await prisma.message.findMany({
      where: {
        roomId: roomId,
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
      orderBy: {
        createdAt: "asc",
      },
    });

    // 🔓 Decrypt content before sending to client
    const messages = rawMessages.map((m: Message & { sender: { id: string; name?: string | null; image?: string | null; email?: string | null } }) => ({
      ...m,
      content: m.content ? decrypt(m.content) : null,
    }));

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
