import type { Message } from "../types";

interface MessageSectionProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isConnected: boolean;
}

const MessageSection = ({
  messages,
  onSendMessage,
  isConnected,
}: MessageSectionProps) => {
  const handleSendMessage = (input: HTMLInputElement) => {
    if (input.value.trim()) {
      onSendMessage(input.value);
      input.value = "";
    }
  };

  return (
    <section className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Room Messages</h2>
      <div className="max-h-60 overflow-y-auto mb-4 border rounded p-2 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet...</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded ${
                msg.type === "system"
                  ? "bg-blue-100 text-blue-800"
                  : msg.type === "clipboard"
                  ? "bg-green-100 text-green-800"
                  : "bg-white"
              }`}
            >
              <span className="text-sm text-gray-500 uppercase">
                [{msg.type}]
              </span>{" "}
              <span className="break-words">{msg.content}</span>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border rounded"
          disabled={!isConnected}
          onKeyPress={(e) => {
            if (e.key === "Enter" && e.currentTarget.value.trim()) {
              handleSendMessage(e.currentTarget);
            }
          }}
        />
        <button
          onClick={(e) => {
            const input = e.currentTarget
              .previousElementSibling as HTMLInputElement;
            handleSendMessage(input);
          }}
          disabled={!isConnected}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </section>
  );
};

export default MessageSection;
