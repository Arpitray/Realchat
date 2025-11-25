"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";

export default function CreateRoomButton({ asCard = false }: { asCard?: boolean }) {
    const router = useRouter();

    const createRoom = () => {
        router.push("/chat/create");
    };

    if (asCard) {
        return (
            <button
                onClick={createRoom}
                className="glass-card p-6 rounded-2xl border-dashed border-2 border-white/20 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-4 h-full min-h-40 group w-full"
            >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                </div>
                <span className="font-medium group-hover:text-primary transition-colors">Create New Room</span>
            </button>
        )
    }

    return (
        <button
            onClick={createRoom}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/25"
        >
            <Plus className="w-4 h-4" />
            Create Room
        </button>
    );
}
