-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_roomId_fkey";

-- DropForeignKey
ALTER TABLE "RoomMember" DROP CONSTRAINT "RoomMember_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Whiteboard" DROP CONSTRAINT "Whiteboard_roomId_fkey";

-- DropForeignKey
ALTER TABLE "WhiteboardElement" DROP CONSTRAINT "WhiteboardElement_boardId_fkey";

-- DropForeignKey
ALTER TABLE "WhiteboardVersion" DROP CONSTRAINT "WhiteboardVersion_boardId_fkey";

-- AddForeignKey
ALTER TABLE "RoomMember" ADD CONSTRAINT "RoomMember_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Whiteboard" ADD CONSTRAINT "Whiteboard_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteboardElement" ADD CONSTRAINT "WhiteboardElement_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Whiteboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteboardVersion" ADD CONSTRAINT "WhiteboardVersion_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Whiteboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
