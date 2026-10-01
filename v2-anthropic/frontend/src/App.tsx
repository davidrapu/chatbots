import { useRef, useState } from "react";
import { useChat } from "./hooks/useChat";
import ChatHeader from "./ui/ChatHeader";
import Composer from "./ui/Composer";
import MessageList from "./ui/MessageList";

export default function App() {
  const { messages, isLoading, error, sendMessage } = useChat();
  const [userInput, setUserInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const send = async (text: string) => {
    setUserInput("");
    const ok = await sendMessage(text);
    if (!ok) setUserInput(text.trim()); // give the text back so the user can resend it
    inputRef.current?.focus();
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-stone-100 sm:p-6 dark:bg-stone-950">
      <section
        aria-label="Chat with Pagi"
        className="flex h-dvh w-full flex-col overflow-hidden bg-stone-50 sm:h-[min(720px,calc(100dvh-3rem))] sm:max-w-md sm:rounded-2xl sm:border sm:border-stone-200 sm:shadow-xl sm:shadow-stone-300/40 dark:bg-stone-900 sm:dark:border-stone-800 sm:dark:shadow-black/30"
      >
        <ChatHeader />
        <MessageList
          messages={messages}
          isLoading={isLoading}
          error={error}
          onSuggestion={send}
        />
        <Composer
          ref={inputRef}
          value={userInput}
          onChange={setUserInput}
          onSend={() => send(userInput)}
          isLoading={isLoading}
        />
      </section>
    </main>
  );
}
