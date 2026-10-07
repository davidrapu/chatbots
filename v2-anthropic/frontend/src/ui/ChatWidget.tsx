import { ChatCircleTextIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import ChatHeader from "./ChatHeader";
import Composer from "./Composer";
import MessageList from "./MessageList";

/**
 * Floating launcher in the bottom-right corner that opens Pagi as a chat panel.
 * The panel stays mounted while closed, so the conversation survives open/close.
 */
export default function ChatWidget() {
  const { messages, isLoading, error, sendMessage } = useChat();
  const [userInput, setUserInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setIsOpen(false);
    launcherRef.current?.focus(); // keyboard users land back where they started
  };

  // Put the cursor in the input as soon as the panel opens
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Escape closes the panel
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const send = async (text: string) => {
    setUserInput("");
    const ok = await sendMessage(text);
    if (!ok) setUserInput(text.trim()); // give the text back so the user can resend it
    inputRef.current?.focus();
  };

  return (
    <>
      <section
        id="pagi-chat"
        aria-label="Chat with Pagi"
        inert={!isOpen}
        className={`fixed inset-0 z-50 flex origin-bottom-right flex-col overflow-hidden bg-stone-50 transition-[opacity,scale] duration-200 ease-out motion-reduce:transition-none sm:inset-auto sm:right-6 sm:bottom-24 sm:h-[min(600px,calc(100dvh-8rem))] sm:w-[380px] sm:rounded-2xl sm:border sm:border-stone-200 sm:shadow-2xl sm:shadow-stone-400/30 dark:bg-stone-900 sm:dark:border-stone-800 sm:dark:shadow-black/40 ${
          isOpen
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <ChatHeader onClose={close} />
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

      {/* On phones the panel is full screen with its own close button, so hide the launcher */}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        aria-expanded={isOpen}
        aria-controls="pagi-chat"
        aria-label={isOpen ? "Close chat" : "Chat with Pagi"}
        className={`fixed right-4 bottom-4 z-50 size-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-700/30 transition-[background-color,scale] duration-150 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-[0.94] sm:right-6 sm:bottom-6 sm:flex ${
          isOpen ? "hidden" : "flex"
        }`}
      >
        {isOpen ? (
          <XIcon size={24} weight="bold" aria-hidden="true" />
        ) : (
          <ChatCircleTextIcon size={28} weight="fill" aria-hidden="true" />
        )}
      </button>
    </>
  );
}
