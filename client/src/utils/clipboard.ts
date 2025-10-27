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
  // Try using Web Crypto API (requires secure context). If it fails
  // (insecure origin or not supported), fall back to a synchronous hash.
  try {
    if (
      typeof crypto !== "undefined" &&
      crypto.subtle &&
      crypto.subtle.digest
    ) {
      const buf = await crypto.subtle.digest(
        "SHA-1",
        new TextEncoder().encode(text)
      );
      const hash = Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      return { contain: text, hash };
    }
  } catch (err) {
    // WebCrypto may throw "The operation is insecure." on insecure origins
    // or if the API is restricted. Fall back to a simple hash below.
    // eslint-disable-next-line no-console
    console.warn("WebCrypto digest failed, falling back to sync hash:", err);
  }

  // Fallback: use the existing synchronous generateHash function
  const fallbackHash = generateHash(text);
  return { contain: text, hash: fallbackHash };
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
