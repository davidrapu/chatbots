import { useState } from "react";
import { sendUserStreamMessage } from "../services/sendUserMessage";
import type { ChatMessage } from "../types";

/**
 * Owns the conversation: message history, loading state and errors.
 * Knows nothing about the input box, so the UI decides what to do on failure.
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Sends a message and streams the reply. Resolves to false if it failed. */
  const sendMessage = async (text: string): Promise<boolean> => {
    const messageToSend = text.trim();
    if (!messageToSend || isLoading) return false;

    const len = messages.length; // cut back to this if the exchange fails
    setError(null);
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, role: "user", content: messageToSend },
    ]);

    try {
      for await (const chunk of sendUserStreamMessage(messageToSend)) {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { ...last, content: last.content + chunk },
            ];
          }
          return [
            ...prev,
            { id: prev.length + 1, role: "assistant", content: chunk },
          ];
        });
      }
      return true;
    } catch (err) {
      console.error("Error sending user message:", err);
      setMessages((prev) => prev.slice(0, len));
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, error, sendMessage };
}
