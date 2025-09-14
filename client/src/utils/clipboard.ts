export const generateHash = (text: string): string => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
};

export const createClipboardItem = async (text: string) => {
  const hash = await crypto.subtle
    .digest("SHA-1", new TextEncoder().encode(text))
    .then((buf) => {
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    });
  return { contain: text, hash };
};

export const fallbackCopy = (text: string) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
    console.log("Text copied using fallback method");
    return true;
  } catch (err) {
    console.error("Fallback copy failed:", err);
    return false;
  } finally {
    document.body.removeChild(textArea);
  }
};

export const checkClipboardPermissions = async (): Promise<boolean> => {
  try {
    if (!navigator.clipboard) {
      return false;
    }

    // Check if HTTPS is required
    if (
      location.protocol !== "https:" &&
      location.hostname !== "localhost" &&
      location.hostname !== "10.184.250.123"
    ) {
      return false;
    }

    // Try to read clipboard to test permissions
    await navigator.clipboard.readText();
    return true;
  } catch (error) {
    console.log("Clipboard permission error:", error);
    return false;
  }
};
