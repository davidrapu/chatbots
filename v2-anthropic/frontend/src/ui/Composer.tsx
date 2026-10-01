import { PaperPlaneRight } from "@phosphor-icons/react";

const MAX_LENGTH = 2000; // matches Field(max_length=2000) on the backend

type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  ref?: React.Ref<HTMLTextAreaElement>;
};

export default function Composer({
  value,
  onChange,
  onSend,
  isLoading,
  ref,
}: ComposerProps) {
  const canSend = !isLoading && value.trim() !== "";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (canSend) onSend();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter adds a new line
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-stone-200 bg-white px-3 pt-3 pb-2 dark:border-stone-800 dark:bg-stone-900"
    >
      <div className="flex items-end gap-2 rounded-xl border border-stone-300 bg-white py-1.5 pr-1.5 pl-3 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/20 dark:border-stone-700 dark:bg-stone-800">
        <label htmlFor="chat-input" className="sr-only">
          Message Pagi
        </label>
        <textarea
          id="chat-input"
          ref={ref}
          rows={1}
          value={value}
          maxLength={MAX_LENGTH}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about loans, investments or payments"
          className="field-sizing-content max-h-32 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-[15px] text-stone-900 placeholder:text-stone-500 focus:outline-none dark:text-stone-50 dark:placeholder:text-stone-400"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-[0.96] disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500 dark:disabled:bg-stone-700 dark:disabled:text-stone-400"
        >
          <PaperPlaneRight size={18} weight="fill" aria-hidden="true" />
        </button>
      </div>
      <p className="mt-2 px-1 text-center text-xs text-stone-500 dark:text-stone-400">
        General information only. Never share your BVN, PIN or account details
        here.
      </p>
    </form>
  );
}
