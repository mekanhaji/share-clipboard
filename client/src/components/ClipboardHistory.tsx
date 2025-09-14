import type { ClipboardItem } from "../types";

interface ClipboardHistoryProps {
  history: ClipboardItem[];
  onCopyItem: (text: string) => Promise<boolean>;
}

const ClipboardHistory = ({ history, onCopyItem }: ClipboardHistoryProps) => {
  const handleCopyItem = async (item: ClipboardItem) => {
    const success = await onCopyItem(item.contain);
    if (success) {
      // You could add a toast notification here
      console.log("Copied to clipboard");
    }
  };

  return (
    <section className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Clipboard History</h2>
      {history.length === 0 ? (
        <p className="text-gray-500">
          No history yet. <br />
          Click "Sync Clipboard" or use manual text sharing to get started.
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {history.map((item, index) => (
            <div
              key={item.hash}
              className="bg-gray-100 p-3 rounded border cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => handleCopyItem(item)}
              title="Click to copy"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs text-gray-500">#{index + 1}</span>
                <span className="text-xs text-gray-400">
                  {item.hash.substring(0, 8)}...
                </span>
              </div>
              <div className="font-mono text-sm break-words">
                {item.contain.length > 100
                  ? item.contain.substring(0, 100) + "..."
                  : item.contain}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ClipboardHistory;
