import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateRoomButton from "./create-room-button";
import JoinRoomButton from "./join-room-button";
import RoomCard from "./room-card";
import type { Room as PrismaRoom } from '@prisma/client';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    const rooms = await prisma.room.findMany({
        where: {
            members: {
                some: {
                    userId: session.user.id,
                },
            },
        },
        orderBy: {
            updatedAt: "desc",
        },
        include: {
            _count: {
                select: { members: true }
            }
        }
    });

    return (
        <div className="min-h-screen bg-background pt-32 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground">Manage your rooms and chats</p>
                    </div>
                    <div className="flex gap-2">
                        <JoinRoomButton />
                        <CreateRoomButton />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Create New Card (Visual) */}
                    <CreateRoomButton asCard />

                    {rooms.map((room: PrismaRoom & { _count: { members: number } }) => (
                        <RoomCard key={room.id} room={room as any} />
                    ))}
                </div>
            </div>
        </div>
    );
}
