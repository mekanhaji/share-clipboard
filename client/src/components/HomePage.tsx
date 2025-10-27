import { useState } from "react";
import type { HomePageProps } from "../types";
import api from "@/lib/api";

const HomePage = ({ onRoomJoin }: HomePageProps) => {
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const createNewRoom = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/create-room");

      onRoomJoin(response.data.room_code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setIsLoading(false);
    }
  };

  const joinExistingRoom = () => {
    if (joinRoomCode.length !== 6) {
      setError("Room code must be exactly 6 characters");
      return;
    }

    setError("");
    onRoomJoin(joinRoomCode.toUpperCase());
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="p-8 rounded-lg shadow-lg w-full max-w-md bg-[var(--color-card)] text-[var(--color-card-foreground)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-2">
            ShareClipBoard
          </h1>
          <p className="text-[var(--color-muted-foreground)]">
            Share your clipboard across devices
          </p>
        </div>

        {error && (
          <div className="bg-[var(--color-destructive)] border border-[var(--color-destructive)] text-[var(--color-card-foreground)] px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Create New Room */}
          <div className="text-center">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-3">
              Create New Room
            </h2>
            <button
              onClick={createNewRoom}
              disabled={isLoading}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--primary-600)] disabled:opacity-50 text-[var(--color-primary-foreground)] font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? "Creating..." : "Create New Room"}
            </button>
          </div>

          <div className="flex items-center">
            <div className="flex-1 border-t border-[var(--border)]"></div>
            <span className="px-4 text-[var(--color-muted-foreground)] text-sm">
              OR
            </span>
            <div className="flex-1 border-t border-[var(--border)]"></div>
          </div>

          {/* Join Existing Room */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3 text-center">
              Join Existing Room
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter 6-digit room code"
                value={joinRoomCode}
                onChange={(e) => {
                  const value = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z]/g, "");
                  if (value.length <= 6) {
                    setJoinRoomCode(value);
                  }
                }}
                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary-600)] focus:border-transparent text-center text-xl font-mono tracking-widest"
                maxLength={6}
              />
              <button
                onClick={joinExistingRoom}
                disabled={joinRoomCode.length !== 6}
                className="w-full bg-[var(--color-accent)] hover:bg-[var(--accent-600)] disabled:opacity-50 text-[var(--color-accent-foreground)] font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;
