"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link as LinkIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function JoinRoomButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Check if it looks like a URL
    if (val.includes("http") || val.includes("bando.app")) {
      try {
        const url = new URL(val);
        const parts = url.pathname.split("/");
        const chatIndex = parts.indexOf("chat");
        if (chatIndex !== -1 && parts[chatIndex + 1]) {
          setInput(parts[chatIndex + 1]);
          return;
        }
      } catch (e) {
        // Invalid URL, just set as is
      }
    }
    
    setInput(val);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!input.trim()) return;

    // Input should already be cleaned by handleInputChange, but double check
    let roomId = input.trim();
    
    // Final safety check if they somehow bypassed onChange
    if (roomId.includes("/")) {
       try {
        const url = new URL(roomId);
        const parts = url.pathname.split("/");
        const chatIndex = parts.indexOf("chat");
        if (chatIndex !== -1 && parts[chatIndex + 1]) {
          roomId = parts[chatIndex + 1];
        }
      } catch (e) {}
    }

    if (!roomId) {
      setError("Invalid Room ID");
      return;
    }

    router.push(`/chat/${roomId}`);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full font-medium hover:bg-secondary/80 transition-all flex items-center gap-2"
      >
        <LinkIcon className="w-4 h-4" />
        Join Room
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-white/10 w-full max-w-md p-6 rounded-2xl shadow-2xl relative"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold mb-2">Join a Room</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Enter an invite link or room ID to join an existing room.
              </p>

              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label htmlFor="roomLink" className="block text-sm font-medium mb-2">
                    Invite Link or ID
                  </label>
                  <input
                    id="roomLink"
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Paste Room ID or Link..."
                    className="w-full px-4 py-2 rounded-lg bg-background border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    autoFocus
                  />
                  {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Join Room
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
