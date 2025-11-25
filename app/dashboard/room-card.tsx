"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Clock, Trash2, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface RoomCardProps {
  room: {
    id: string;
    name: string;
    updatedAt: Date;
    _count: {
      members: number;
    };
  };
}

export default function RoomCard({ room }: RoomCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this room? All messages will be lost.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/chat/${room.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete room");
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("Error deleting room");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Link
      href={`/chat/${room.id}`}
      className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-all group relative overflow-hidden block"
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 hover:bg-red-500/20 text-red-500 rounded-full transition-colors"
          title="Delete Room"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
        <div className="p-2">
            <MessageSquare className="w-5 h-5 text-primary" />
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-2 truncate pr-16">{room.name}</h3>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {new Date(room.updatedAt).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          {room._count.members} members
        </div>
      </div>
    </Link>
  );
}
