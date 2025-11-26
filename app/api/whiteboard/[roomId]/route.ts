import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

export async function POST(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { roomId } = await params;
    const body = await req.json();
    const { elements } = body;

    if (!elements) {
      console.error("Missing elements in request body");
      return NextResponse.json({ error: "Missing elements" }, { status: 400 });
    }

    console.log(`Saving whiteboard for room ${roomId}, elements count: ${elements?.length}`);

    // Save in DB
    try {
      await prisma.whiteboard.upsert({
        where: { roomId },
        create: { roomId, data: JSON.stringify(elements) },
        update: { data: JSON.stringify(elements) },
      });
      console.log("DB save successful");
    } catch (dbError) {
      console.error("Database save failed:", dbError);
      return NextResponse.json({ error: "Database save failed", details: String(dbError) }, { status: 500 });
    }

    // Broadcast to room users
    try {
      const payload = JSON.stringify({ elements });
      // Pusher limit is 10KB (10240 bytes). We use 9KB as a safe limit.
      if (Buffer.byteLength(payload) < 9000) {
        await pusherServer.trigger(`whiteboard-${roomId}`, "update", { elements });
      } else {
        // Payload too large, tell clients to fetch from server
        await pusherServer.trigger(`whiteboard-${roomId}`, "update", { action: "refresh" });
      }
    } catch (pusherError) {
      console.error("Pusher trigger failed:", pusherError);
      // We don't fail the request if Pusher fails, as the data is saved.
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving whiteboard:", error);
    return NextResponse.json({ error: "Internal Server Error", details: String(error) }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const { roomId } = await params;

    const board = await prisma.whiteboard.findUnique({ where: { roomId } });

    return NextResponse.json({
      elements: board?.data ? JSON.parse(board.data) : [],
    });
  } catch (error) {
    console.error("Error fetching whiteboard:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
