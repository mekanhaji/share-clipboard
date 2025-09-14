import { useState } from "react";

interface ManualTextShareProps {
  onShareText: (text: string) => void;
  isConnected: boolean;
}

const ManualTextShare = ({
  onShareText,
  isConnected,
}: ManualTextShareProps) => {
  const [manualText, setManualText] = useState("");

  const handleShare = () => {
    if (manualText.trim()) {
      onShareText(manualText.trim());
      setManualText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleShare();
    }
  };

  return (
    <section className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-3">Manual Text Share</h2>
      <p className="text-gray-600 text-sm mb-3">
        Use this if clipboard access is restricted on your device.
      </p>
      <div className="flex gap-2">
        <textarea
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type or paste text to share... (Ctrl+Enter to send)"
          className="flex-1 border rounded p-3 min-h-[80px] resize-vertical"
          disabled={!isConnected}
        />
        <div className="flex flex-col gap-2">
          <button
            onClick={handleShare}
            disabled={!manualText.trim() || !isConnected}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 whitespace-nowrap"
          >
            Share Text
          </button>
          <button
            onClick={() => setManualText("")}
            disabled={!manualText}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 text-sm"
          >
            Clear
          </button>
        </div>
      </div>
      {manualText && (
        <div className="mt-2 text-sm text-gray-500">
          {manualText.length} characters
        </div>
      )}
    </section>
  );
};

export default ManualTextShare;
