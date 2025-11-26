import WhiteboardWrapper from "@/app/components/WhiteboardWrapper";
import { prisma } from "@/lib/prisma";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function WhiteboardPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  // Verify membership
  const member = await prisma.roomMember.findUnique({
    where: {
      roomId_userId: {
        roomId,
        userId: session.user.id,
      },
    },
  });

  if (!member) {
    redirect("/dashboard");
  }
  
  const board = await prisma.whiteboard.findUnique({
    where: { roomId },
  });

  const initialElements = board?.data ? JSON.parse(board.data) : [];

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <WhiteboardWrapper roomId={roomId} initialElements={initialElements} />
    </div>
  );
}
