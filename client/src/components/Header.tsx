import React from "react";
import { CloudOff, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  roomCode: string;
  isConnected: boolean;
  clipboardError?: string | null;
  onLeaveRoom: () => void;
}

const Header: React.FC<HeaderProps> = ({
  roomCode,
  isConnected,
  clipboardError,
  onLeaveRoom,
}) => {
  return (
    <section className="rounded-lg shadow">
      {!clipboardError && (
        <div className="bg-yellow-600 rounded-tr-lg rounded-tl-lg">
          <p className="text-white text-sm mt-1 text-center">
            ⚠️ {clipboardError}
          </p>
        </div>
      )}
      <section className="flex items-center justify-between bg-white px-4">
        <div>
          <img src="logo.png" alt="Logo" className="h-16" />
          {/* <p className="text-gray-600">
          Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </p>
         */}
        </div>
        <div className="flex gap-1">
          <h1
            className={cn(
              "text-xl bg-accent text-white px-2 py-1 rounded-bl-2xl rounded-tl-2xl text-center flex items-center gap-1 justify-center",
              { "bg-yellow-600": !isConnected }
            )}
          >
            {!isConnected && <CloudOff className="h-4 w-4" />}
            {roomCode}
          </h1>
          <div>
            <button
              onClick={onLeaveRoom}
              className="bg-red-500 hover:bg-red-600 h-full text-white px-2 rounded-tr-2xl rounded-br-2xl"
            >
              <LogOut className="h-5" />
            </button>
          </div>
        </div>
      </section>
    </section>
  );
};

export default Header;
