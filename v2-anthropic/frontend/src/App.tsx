import ChatWidget from "./ui/ChatWidget";

/**
 * Stand-in for the Page Financials website. In Phase 10 only <ChatWidget /> gets
 * embedded in the real site; this page just gives the widget something to sit on.
 */
export default function App() {
  return (
    <main className="min-h-dvh bg-stone-100 px-6 py-16 dark:bg-stone-950">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold text-stone-900 dark:text-stone-50">
          Page Financials
        </h1>
        <p className="mt-3 text-stone-600 dark:text-stone-400">
          Placeholder page. Click the chat button in the bottom-right corner to
          talk to Pagi.
        </p>
      </div>
      <ChatWidget />
    </main>
  );
}
