"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

export default function CreateRoomPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/chat/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        const room = await res.json();
        router.push(`/chat/${room.id}`);
      } else {
        console.error("Failed to create room");
      }
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-xl"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Create a New Room</h1>
        
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div>
            <label htmlFor="roomName" className="block text-sm font-medium mb-2">
              Room Name
            </label>
            <input
              id="roomName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Project Alpha Discussion"
              className="w-full p-3 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Create Room"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
