import { ChatCircleTextIcon, XIcon } from "@phosphor-icons/react";

export default function ChatHeader({ onClose }: { onClose: () => void }) {
  return (
    <header className="flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex size-9 items-center justify-center rounded-full bg-brand-600 text-white">
        <ChatCircleTextIcon size={20} weight="fill" aria-hidden="true" />
      </div>
      {/* h2, not h1: the widget sits inside someone else's page, which owns the h1 */}
      <div className="flex-1 leading-tight">
        <h2 className="text-[15px] font-semibold text-stone-900 dark:text-stone-50">
          Pagi
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Page Financials assistant
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close chat"
        className="flex size-9 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800 focus-visible:outline-2 focus-visible:outline-brand-600 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
      >
        <XIcon size={18} weight="bold" aria-hidden="true" />
      </button>
    </header>
  );
}
