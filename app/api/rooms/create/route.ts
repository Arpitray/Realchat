import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name } = body;

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        const room = await prisma.room.create({
            data: {
                name,
                members: {
                    create: [
                        {
                            userId: session.user.id,
                        },
                    ],
                },
            },
        });

        return NextResponse.json(room);
    } catch (error) {
        console.log("[ROOM_CREATE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
