import { useEffect, useRef } from "react";
import type { ChatMessage } from "../types";
import EmptyState from "./EmptyState";
import ErrorNotice from "./ErrorNotice";
import Loader from "./Loader";
import Message, { MarkdownText } from "./Message";

type MessageListProps = {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSuggestion: (suggestion: string) => void;
};

export default function MessageList({
  messages,
  isLoading,
  error,
  onSuggestion,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading, error]);

  const lastMessage = messages[messages.length - 1];
  const showTyping = isLoading && lastMessage?.role === "user";

  return (
    <div
      ref={scrollRef}
      role="log"
      aria-live="polite"
      aria-busy={isLoading}
      className="scroll-area flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 relative"
    >
      {messages.length === 0 ? (
        <EmptyState onSelect={onSuggestion} />
      ) : (
        <div className="mt-auto flex flex-col gap-3">
          {messages.map((message) => (
            <Message key={message.id} role={message.role}>
              {message.role === "assistant" ? (
                <MarkdownText text={message.content} />
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </Message>
          ))}
          {showTyping && (
            <Message role="assistant">
              <Loader />
              <span className="sr-only">Pagi is typing</span>
            </Message>
          )}
        </div>
      )}

      {error && <ErrorNotice message={error} />}
    </div>
  );
}
