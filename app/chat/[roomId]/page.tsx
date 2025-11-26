"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/lib/pusher-client";
import { motion, AnimatePresence } from "motion/react";
import { Send, Paperclip, MoreVertical, Phone, Video, Users, PenTool, MessageSquare, Share2, Copy, Check, Trash2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/app/components/modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/app/components/dropdown-menu";
import { useRouter } from "next/navigation";


export default function ChatPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { data: session } = useSession();
  const { roomId } = React.use(params);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [roomName, setRoomName] = useState("");
  const [isWhiteboardMode, setIsWhiteboardMode] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);




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

    channel.bind("message-deleted", ({ id }: { id: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
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

  const deleteMessage = async (messageId: string) => {
    if (!confirm("Delete this message?")) return;
    
    // Optimistic update
    setMessages((prev) => prev.filter((m) => m.id !== messageId));

    try {
      const res = await fetch(`/api/chat/message/${messageId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        // Revert if failed (optional, but good practice)
        // For simplicity, we'll just fetch messages again or show error
        console.error("Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };


  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDeleteRoom = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/chat/${roomId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        alert("Failed to delete room");
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("Error deleting room");
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Navbar Spacer */}
      <div className="h-16 md:h-20 shrink-0" />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar (Hidden on mobile for now, or collapsible) */}
        <div className="w-20 lg:w-80 border-r border-white/10 bg-card/30 hidden md:flex flex-col shrink-0">
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
        <div className="flex-1 flex flex-col min-w-0 bg-background/50 backdrop-blur-sm w-full">
          {/* Header */}
          <header className="h-16 border-b border-white/10 bg-card/30 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shrink-0 z-10">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-linear-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm md:text-base">
                {(roomName || roomId).slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-base md:text-lg truncate">{roomName || `Room: ${roomId}`}</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Active
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={() => setIsShareOpen(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground md:hidden"
              title="Share Room"
            >
              <Share2 className="w-5 h-5" />
            </button>
              <div className="bg-white/5 rounded-full p-1 flex border border-white/10">
                <button
                  onClick={() => setIsWhiteboardMode(false)}
                  className={cn(
                    "px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all flex items-center gap-2",
                    !isWhiteboardMode ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Chat</span>
                </button>
                <button
                  onClick={() => setIsWhiteboardMode(true)}
                  className={cn(
                    "px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all flex items-center gap-2",
                    isWhiteboardMode ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <PenTool className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Board</span>
                </button>
              </div>

              <div className="h-8 w-px bg-white/10 mx-2 hidden md:block" />

              <button
                onClick={() => setIsShareOpen(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground hidden md:block"
                title="Share Room"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground hidden md:block">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground hidden md:block">
                <Video className="w-5 h-5" />
              </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground outline-none">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48 bg-card border-white/10">
                <DropdownMenuItem onClick={() => setIsShareOpen(true)} className="cursor-pointer">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Room
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  onClick={() => setIsDeleteOpen(true)} 
                  className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Room
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 relative overflow-hidden flex flex-col">
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
                  className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
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
                            "flex gap-3 max-w-[85%] md:max-w-[70%]",
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
                          "p-3 md:p-4 rounded-2xl shadow-sm backdrop-blur-sm relative group/message",
                          isMe
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-card/50 border border-white/10 rounded-tl-none"
                        )}>
                          {!isMe && <p className="text-xs font-bold mb-1 opacity-70">{msg.sender?.name || "Unknown"}</p>}
                          <p className="leading-relaxed text-sm md:text-base wrap-break-word">{msg.content}</p>
                          <span className="text-[10px] opacity-50 mt-1 block">
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          
                          {isMe && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="absolute -top-2 -left-2 p-1 rounded-full bg-background border border-white/10 shadow-sm opacity-100 md:opacity-0 md:group-hover/message:opacity-100 transition-opacity">
                                  <MoreVertical className="w-3 h-3 text-muted-foreground" />
                                </button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="start" className="w-32">
                                <DropdownMenuItem 
                                  onClick={() => deleteMessage(msg.id)}
                                  className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer text-xs"
                                >
                                  <Trash2 className="w-3 h-3 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>

                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-background/80 backdrop-blur-lg border-t border-white/10 shrink-0 z-20 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
                      className="flex-1 bg-transparent border-none focus:ring-0 py-3 px-2 text-foreground placeholder:text-muted-foreground/50 resize-none min-w-0"
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
      {/* Modals */}
      <Modal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} title="Share Room">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Share this room with others to collaborate in real-time.
          </p>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Room Link</label>
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-secondary/50 rounded-xl border border-white/10 text-sm truncate font-mono">
                {currentUrl}
              </div>
              <button

                onClick={copyLink}
                className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shrink-0"
              >
                {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Room ID</label>
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-secondary/50 rounded-xl border border-white/10 text-sm truncate font-mono">
                {roomId}
              </div>
              <button
                onClick={copyRoomId}
                className="p-3 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-colors shrink-0"
              >
                {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Room">
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-500">
            <div className="shrink-0 mt-0.5">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-sm">
              <p className="font-bold mb-1">Warning: This action cannot be undone.</p>
              <p className="opacity-90">This will permanently delete the room <strong>{roomName}</strong> and all its messages.</p>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteRoom}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : "Delete Room"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
