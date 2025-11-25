"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/lib/pusher-client";
import { motion, AnimatePresence } from "motion/react";
import { Send, Paperclip, MoreVertical, Phone, Video, Users, PenTool, MessageSquare, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { data: session } = useSession();
  const { roomId } = React.use(params);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [roomName, setRoomName] = useState("");
  const [isWhiteboardMode, setIsWhiteboardMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomId) return;

    // Join room and get details
    const joinRoom = async () => {
      try {
        const res = await fetch(`/api/chat/${roomId}/join`, { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setRoomName(data.roomName);
        }
      } catch (error) {
        console.error("Failed to join room:", error);
      }
    };

    joinRoom();

    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/${roomId}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();

    const channel = pusherClient.subscribe(`room-${roomId}`);

    channel.bind("new-message", (msg: any) => {
      setMessages((prev) => {
        // Avoid duplicates if the message we just sent comes back via Pusher
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      pusherClient.unsubscribe(`room-${roomId}`);
    };
  }, [roomId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim()) return;

    await fetch("/api/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, content: input }),
    });

    setInput("");
  }

  const copyLink = () => {
    navigator.clipboard.writeText(roomId);
    alert("Room ID copied to clipboard!");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden pt-20">
      {/* Sidebar (Hidden on mobile for now, or collapsible) */}
      <div className="w-20 lg:w-80 border-r border-white/10 bg-card/30 hidden md:flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-bold text-lg hidden lg:block">Channels</h2>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {/* Mock Channels */}
          {['General', 'Design', 'Engineering', 'Random'].map((channel) => (
            <button
              key={channel}
              className={cn(
                "w-full p-3 rounded-xl flex items-center gap-3 transition-all",
                channel === 'General' ? "bg-primary/10 text-primary" : "hover:bg-white/5 text-muted-foreground"
              )}
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <span className="text-lg">#</span>
              </div>
              <div className="hidden lg:block text-left">
                <div className="font-medium">{channel}</div>
                <div className="text-xs opacity-60">24 active</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-16 border-b border-white/10 bg-card/30 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
              {(roomName || roomId).slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="font-bold text-lg">{roomName || `Room: ${roomId}`}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Active
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={copyLink}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground md:hidden"
              title="Copy Room ID"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <div className="bg-white/5 rounded-full p-1 flex border border-white/10">
              <button
                onClick={() => setIsWhiteboardMode(false)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                  !isWhiteboardMode ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <MessageSquare className="w-4 h-4" />
                Chat
              </button>
              <button
                onClick={() => setIsWhiteboardMode(true)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                  isWhiteboardMode ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <PenTool className="w-4 h-4" />
                Board
              </button>
            </div>

            <div className="h-8 w-px bg-white/10 mx-2 hidden md:block" />

            <button
              onClick={copyLink}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground hidden md:block"
              title="Copy Room ID"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground hidden md:block">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground hidden md:block">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground hidden md:block">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 relative overflow-hidden">
          {isWhiteboardMode ? (
            <div className="absolute inset-0 flex items-center justify-center bg-grid-white/[0.02]">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <PenTool className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-muted-foreground">Whiteboard Coming Soon</h3>
                <p className="text-sm text-muted-foreground/60">Infinite canvas implementation in progress...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div
                ref={scrollRef}
                className="absolute inset-0 overflow-y-auto p-6 space-y-6 pb-32"
              >
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                    <MessageSquare className="w-16 h-16 mb-4" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => {
                    const isMe = msg.sender?.id === session?.user?.id;
                    return (
                      <motion.div
                        key={msg.id || i}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={cn(
                          "flex gap-3 max-w-[80%]",
                          isMe ? "ml-auto flex-row-reverse" : ""
                        )}
                      >
                        {msg.sender?.image ? (
                          <img 
                            src={msg.sender.image} 
                            alt={msg.sender.name || "User"} 
                            className="w-8 h-8 rounded-full object-cover shrink-0 bg-white/10" 
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-500 to-cyan-500 shrink-0 flex items-center justify-center text-[10px] font-bold text-white">
                            {msg.sender?.name?.slice(0, 2).toUpperCase() || "??"}
                          </div>
                        )}
                        
                        <div className={cn(
                          "p-4 rounded-2xl shadow-sm backdrop-blur-sm",
                          isMe
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-card/50 border border-white/10 rounded-tl-none"
                        )}>
                          {!isMe && <p className="text-xs font-bold mb-1 opacity-70">{msg.sender?.name || "Unknown"}</p>}
                          <p className="leading-relaxed">{msg.content}</p>
                          <span className="text-[10px] opacity-50 mt-1 block">
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Input Area */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-background via-background to-transparent z-20">
                <form
                  onSubmit={sendMessage}
                  className="max-w-4xl mx-auto relative flex items-end gap-2 p-2 rounded-3xl glass shadow-2xl"
                >
                  <button
                    type="button"
                    className="p-3 hover:bg-white/10 rounded-full text-muted-foreground transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none focus:ring-0 py-3 px-2 text-foreground placeholder:text-muted-foreground/50 resize-none"
                  />

                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
