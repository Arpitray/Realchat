"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { pusherClient } from "@/lib/pusher-client";
import { ArrowLeft } from "lucide-react";
import "@excalidraw/excalidraw/index.css"; // Import Excalidraw styles
import "./whiteboard.css"; // Import custom overrides
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "next-themes";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { 
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-zinc-900 text-white">Loading Canvas...</div>
  }
);

function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default function WhiteboardWrapper({ roomId, initialElements }: { roomId: string, initialElements: any[] }) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [elements, setElements] = useState<any[]>(initialElements);
  const [mounted, setMounted] = useState(false);
  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");

  // Handle incoming updates from Pusher
  useEffect(() => {
    const channel = pusherClient.subscribe(`whiteboard-${roomId}`);

    channel.bind("update", (data: { elements: any[] }) => {
      if (excalidrawAPI) {
        // Only update if the elements are different to avoid loops/flicker
        // This is a naive check, ideally we check version/ids
        const currentElements = excalidrawAPI.getSceneElements();
        if (JSON.stringify(currentElements) !== JSON.stringify(data.elements)) {
             isRemoteUpdate.current = true;
             excalidrawAPI.updateScene({ elements: data.elements });
        }
      }
    });

    return () => {
      pusherClient.unsubscribe(`whiteboard-${roomId}`);
    };
  }, [roomId, excalidrawAPI]);

  const saveToDb = async (elements: any[]) => {
    setSaveStatus("saving");
    try {
      await fetch(`/api/whiteboard/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elements }),
      });
      setSaveStatus("saved");
    } catch (error) {
      console.error("Failed to save whiteboard:", error);
      setSaveStatus("error");
    }
  };

  const debouncedSave = useCallback(
    debounce((elements: any[]) => saveToDb(elements), 1000),
    [roomId]
  );

  const onChange = (elements: readonly any[], appState: any, files: any) => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    // We only want to save if there are changes
    // Excalidraw calls onChange frequently
    debouncedSave(elements);
  };

  return (
    <div className="h-full w-full relative ">
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => router.push(`/chat/${roomId}`)}
          className="bg-zinc-900/50 backdrop-blur-md  mt-12 text-zinc-100 px-4 py-2 rounded-full shadow-lg hover:bg-zinc-800/50 transition-all flex items-center gap-2 text-sm font-medium border border-white/10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Chat
        </button>
      </div>
      <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
        <div className="bg-zinc-900/50 mt-11 backdrop-blur-md rounded-full border border-white/10 shadow-lg px-3 py-1.5">
          <span className={`text-xs font-medium ${
            saveStatus === "saving" ? "text-yellow-500" : 
            saveStatus === "error" ? "text-red-500" : 
            "text-green-500"
          }`}>
            {saveStatus === "saving" ? "Saving..." : 
             saveStatus === "error" ? "Error" : 
             "Saved"}
          </span>
        </div>
        <div className="bg-zinc-900/50 mt-11 mr-6 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
          <ThemeToggle />
        </div>
      </div>
      {mounted && (
        <Excalidraw
          initialData={{ elements: initialElements, appState: { currentItemFontFamily: 1 } }}
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          onChange={onChange}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          UIOptions={{
            canvasActions: {
              changeViewBackgroundColor: false,
            }
          }}
        />
      )}
    </div>
  );
}
