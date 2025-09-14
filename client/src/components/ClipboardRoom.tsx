import type { ClipboardRoomProps } from "../types";
import { useClipboard } from "../hooks/useClipboard";
import { ClipboardHistory, MessageSection, ManualTextShare } from ".";

const ClipboardRoom = ({
  roomCode,
  isConnected,
  setIsConnected,
  onLeaveRoom,
}: ClipboardRoomProps) => {
  const {
    getBoard,
    history,
    clearHistory,
    messages,
    sendMessage,
    shareText,
    clipboardError,
    copy,
  } = useClipboard(roomCode, setIsConnected);

  return (
    <main className="flex flex-col gap-4 p-4 max-w-4xl mx-auto">
      {/* Header Section */}
      <section className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <div>
          <h1 className="text-3xl font-bold">Room: {roomCode}</h1>
          <p className="text-gray-600">
            Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
          </p>
          {clipboardError && (
            <p className="text-yellow-600 text-sm mt-1">⚠️ {clipboardError}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onLeaveRoom}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Leave Room
          </button>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Clear
            </button>
          )}
          <button
            onClick={getBoard}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            disabled={!isConnected}
          >
            Sync Clipboard
          </button>
        </div>
      </section>

      {/* Manual Text Share Section */}
      <ManualTextShare onShareText={shareText} isConnected={isConnected} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Messages Section */}
        <MessageSection
          messages={messages}
          onSendMessage={sendMessage}
          isConnected={isConnected}
        />

        {/* Clipboard History Section */}
        <ClipboardHistory history={history} onCopyItem={copy} />
      </div>
    </main>
  );
};

export default ClipboardRoom;
