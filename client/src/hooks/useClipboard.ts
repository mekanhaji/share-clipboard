import { useState, useEffect, useRef } from "react";
import type { ClipboardItem, Message } from "../types";
import {
  generateHash,
  createClipboardItem,
  fallbackCopy,
  checkClipboardPermissions,
} from "../utils/clipboard";

const API_ENDPOINT = import.meta.env.VITE_WS;

export const useClipboard = (
  roomCode: string,
  setIsConnected: (connected: boolean) => void
) => {
  const [history, setHistory] = useState<ClipboardItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [clipboardError, setClipboardError] = useState<string>("");
  const navigator = window.navigator;
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket(`${API_ENDPOINT}/ws?room=${roomCode}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Connected to room:", roomCode);
        setIsConnected(true);
        checkPermissions();
      };

      ws.onmessage = (event) => {
        try {
          const message: Message = JSON.parse(event.data);
          setMessages((prev) => [...prev, message]);

          // If it's a clipboard message, add to history
          if (message.type === "clipboard") {
            const clipboardItem: ClipboardItem = {
              contain: message.content,
              hash: generateHash(message.content),
            };
            setHistory((prev) => {
              if (prev.find((item) => item.hash === clipboardItem.hash)) {
                return prev;
              }
              return [clipboardItem, ...prev];
            });
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      ws.onclose = () => {
        console.log("Disconnected from room");
        setIsConnected(false);
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [roomCode, setIsConnected]);

  const checkPermissions = async () => {
    const hasPermissions = await checkClipboardPermissions();
    if (!hasPermissions) {
      setClipboardError(
        "Clipboard access may be restricted. Use manual text sharing if needed."
      );
    } else {
      setClipboardError("");
    }
  };

  const copy = async (text: string) => {
    try {
      if (navigator.clipboard && (await checkClipboardPermissions())) {
        await navigator.clipboard.writeText(text);
        console.log("Text copied successfully");
        return true;
      } else {
        return fallbackCopy(text);
      }
    } catch (error) {
      console.error("Copy failed:", error);
      return fallbackCopy(text);
    }
  };

  const getBoard = async () => {
    try {
      if (!navigator.clipboard || !(await checkClipboardPermissions())) {
        setClipboardError(
          "Cannot read clipboard. Please use manual text sharing."
        );
        return;
      }

      const text = await navigator.clipboard.readText();
      if (!text || text.trim() === "") {
        console.log("Clipboard is empty");
        return;
      }

      const newItem = await createClipboardItem(text);
      if (history.find((item) => item.hash === newItem.hash)) {
        console.log("Item already exists in history");
        return;
      }

      setHistory((prev) => [newItem, ...prev]);

      // Send clipboard content to room
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const message: Message = {
          type: "clipboard",
          content: text,
          room: roomCode,
        };
        wsRef.current.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error("Error reading clipboard:", error);
      setClipboardError(
        "Failed to read clipboard: " + (error as Error).message
      );
    }
  };

  const sendMessage = (content: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message: Message = {
        type: "text",
        content,
        room: roomCode,
      };
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const shareText = (text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message: Message = {
        type: "clipboard",
        content: text,
        room: roomCode,
      };
      wsRef.current.send(JSON.stringify(message));

      // Add to local history
      createClipboardItem(text).then((newItem) => {
        setHistory((prev) => {
          if (prev.find((item) => item.hash === newItem.hash)) {
            return prev;
          }
          return [newItem, ...prev];
        });
      });
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  // Listen to copy events (even outside the app)
  useEffect(() => {
    const handleCopy = async () => {
      try {
        if (!(await checkClipboardPermissions())) return;

        const text = await navigator.clipboard.readText();
        if (!text) return;

        const newItem = await createClipboardItem(text);
        setHistory((prev) => {
          if (prev.find((item) => item.hash === newItem.hash)) {
            return prev;
          }
          return [newItem, ...prev];
        });

        // Send to room
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const message: Message = {
            type: "clipboard",
            content: text,
            room: roomCode,
          };
          wsRef.current.send(JSON.stringify(message));
        }
      } catch (e) {
        // Clipboard API may fail if not focused or allowed
      }
    };

    window.addEventListener("copy", handleCopy);
    return () => {
      window.removeEventListener("copy", handleCopy);
    };
  }, [navigator, roomCode]);

  return {
    copy,
    getBoard,
    history,
    clearHistory,
    messages,
    sendMessage,
    shareText,
    clipboardError,
  };
};
