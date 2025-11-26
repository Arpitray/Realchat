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
    console.log("WhiteboardWrapper mounted, initialElements:", initialElements?.length);
  }, [initialElements]);

  // Force update scene when API is ready to ensure data is loaded
  useEffect(() => {
    if (excalidrawAPI && initialElements && initialElements.length > 0) {
      // Always sync with initialElements on mount if they exist
      // This fixes the issue where refreshing might show a blank canvas
      const currentElements = excalidrawAPI.getSceneElements();
      // We check if the scene is effectively empty or if we just mounted
      if (currentElements.length === 0 || mounted) {
         // Use a small timeout to ensure Excalidraw is fully ready
         setTimeout(() => {
            if (JSON.stringify(excalidrawAPI.getSceneElements()) !== JSON.stringify(initialElements)) {
               console.log("Hydrating Excalidraw with initial elements (forced)");
               excalidrawAPI.updateScene({ elements: initialElements });
               lastSavedData.current = JSON.stringify(initialElements);
            }
         }, 100);
      }
    }
  }, [excalidrawAPI, initialElements, mounted]);

  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");

  const lastSavedData = useRef<string>(JSON.stringify(initialElements));

  // Handle incoming updates from Pusher
  useEffect(() => {
    const channel = pusherClient.subscribe(`whiteboard-${roomId}`);

    channel.bind("update", async (data: { elements?: any[], action?: string }) => {
      if (!excalidrawAPI) return;

      let newElements = data.elements;

      // If the server tells us to refresh (payload too large), fetch from API
      if (data.action === "refresh") {
        try {
          const res = await fetch(`/api/whiteboard/${roomId}`);
          const json = await res.json();
          if (json.elements) {
            newElements = json.elements;
          }
        } catch (err) {
          console.error("Failed to fetch whiteboard update:", err);
          return;
        }
      }

      if (newElements) {
        // Only update if the elements are different to avoid loops/flicker
        const currentElements = excalidrawAPI.getSceneElements();
        const newElementsStr = JSON.stringify(newElements);
        
        if (JSON.stringify(currentElements) !== newElementsStr) {
             isRemoteUpdate.current = true;
             excalidrawAPI.updateScene({ elements: newElements });
             // Update lastSavedData to prevent echoing back the remote update
             lastSavedData.current = newElementsStr;
        }
      }
    });

    return () => {
      pusherClient.unsubscribe(`whiteboard-${roomId}`);
    };
  }, [roomId, excalidrawAPI]);

  const saveToDb = async (elements: any[]) => {
    const currentData = JSON.stringify(elements);
    
    // Prevent saving if data hasn't changed
    if (currentData === lastSavedData.current) {
      return;
    }

    setSaveStatus("saving");
    try {
      await fetch(`/api/whiteboard/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elements }),
      });
      lastSavedData.current = currentData;
      setSaveStatus("saved");
    } catch (error) {
      console.error("Failed to save whiteboard:", error);
      setSaveStatus("error");
    }
  };

  const saveToDbRef = useRef(saveToDb);
  useEffect(() => {
    saveToDbRef.current = saveToDb;
  });

  const debouncedSave = React.useMemo(
    () => debounce((elements: any[]) => saveToDbRef.current(elements), 3000),
    []
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
