const SUGGESTIONS = [
  "What loans do you offer?",
  "How do I apply for a loan?",
  "What is the minimum investment?",
  "How can I contact you?",
];

export default function EmptyState({
  onSelect,
}: {
  onSelect: (suggestion: string) => void;
}) {
  return (
    <div className="mt-auto flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
          Hi, I'm Pagi.
        </h2>
        <p className="mt-1 max-w-[34ch] text-sm leading-relaxed text-stone-600 dark:text-stone-400">
          I can answer general questions about Page Financials loans,
          investments and payments.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSelect(suggestion)}
            className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 transition-colors hover:border-brand-500 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-[0.98] dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:border-brand-500 dark:hover:text-brand-50"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
