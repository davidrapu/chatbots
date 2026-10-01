import Markdown from "react-markdown";

type MessageProps = {
  role: "user" | "assistant";
  children: React.ReactNode;
};

export default function Message({ role, children }: MessageProps) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={
          isUser
            ? "max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 px-3.5 py-2.5 text-[15px] leading-relaxed text-white"
            : "max-w-[85%] rounded-2xl rounded-bl-md border border-stone-200 bg-white px-3.5 py-2.5 text-[15px] leading-relaxed text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
        }
      >
        <span className="sr-only">{isUser ? "You said:" : "Pagi said:"}</span>
        {children}
      </div>
    </div>
  );
}

export function MarkdownText({ text }: { text: string }) {
  return (
    <div className="chat-markdown">
      <Markdown
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {text}
      </Markdown>
    </div>
  );
}
