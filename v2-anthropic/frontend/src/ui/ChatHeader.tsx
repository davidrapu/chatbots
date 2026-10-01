import { ChatCircleText } from "@phosphor-icons/react";

export default function ChatHeader() {
  return (
    <header className="flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex size-9 items-center justify-center rounded-full bg-brand-600 text-white">
        <ChatCircleText size={20} weight="fill" aria-hidden="true" />
      </div>
      <div className="leading-tight">
        <h1 className="text-[15px] font-semibold text-stone-900 dark:text-stone-50">
          Pagi
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Page Financials assistant
        </p>
      </div>
    </header>
  );
}
