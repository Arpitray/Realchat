import WhiteboardWrapper from "@/app/components/WhiteboardWrapper";
import { prisma } from "@/lib/prisma";
import React from "react";

export default async function WhiteboardPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  
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
