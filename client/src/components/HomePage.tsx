import { useState } from "react";
import type { HomePageProps } from "../types";

const HomePage = ({ onRoomJoin }: HomePageProps) => {
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const createNewRoom = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://10.184.250.123:8080/create-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create room");
      }

      const data = await response.json();
      onRoomJoin(data.room_code);
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
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ShareClipBoard
          </h1>
          <p className="text-gray-600">Share your clipboard across devices</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Create New Room */}
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Create New Room
            </h2>
            <button
              onClick={createNewRoom}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? "Creating..." : "Create New Room"}
            </button>
          </div>

          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl font-mono tracking-widest"
                maxLength={6}
              />
              <button
                onClick={joinExistingRoom}
                disabled={joinRoomCode.length !== 6}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition-colors"
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
