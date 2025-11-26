import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

export async function POST(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { roomId } = await params;
  const { elements } = await req.json();

  // Save in DB
  await prisma.whiteboard.upsert({
    where: { roomId },
    create: { roomId, data: JSON.stringify(elements) },
    update: { data: JSON.stringify(elements) },
  });

  // Broadcast to room users
  await pusherServer.trigger(`whiteboard-${roomId}`, "update", { elements });

  return NextResponse.json({ success: true });
}

export async function GET(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;

  const board = await prisma.whiteboard.findUnique({ where: { roomId } });

  return NextResponse.json({
    elements: board?.data ? JSON.parse(board.data) : [],
  });
}
