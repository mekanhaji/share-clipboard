import type { ClipboardRoomProps } from "../types";
import { useClipboard } from "../hooks/useClipboard";
import { ClipboardHistory, MessageSection, ManualTextShare } from ".";
import Header from "./Header";

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
      <Header
        roomCode={roomCode}
        isConnected={isConnected}
        clipboardError={clipboardError}
        onLeaveRoom={onLeaveRoom}
        history={history}
        clearHistory={clearHistory}
        getBoard={getBoard}
      />

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
