import { useEffect, useRef, useState } from "react";
import { sendUserStreamMessage } from "./services/sendUserMessage";
import Loader from "./ui/Loader";
import Message from "./ui/Message";
import Markdown from "react-markdown";


const exampleMessageHistory: { id: number; role: "user" | "assistant"; content: string }[] = [
  { id:1, role: "user", content: "Hello, how are you?" },
  {
    id:2,
    role: "assistant",
    content: "I'm good, thank you! How can I assist you today?",
  },
  { id:3, role: "user", content: "Can you tell me a joke?" },
  {
    id:4,
    role: "assistant",
    content:
      "Sure! Why don't scientists trust atoms? Because they make up everything!",
  },
  { id:5, role: "user", content: "That's funny! Can you tell me another one?" },
  {
    id:6,
    role: "assistant",
    content:
      "Of course! Why did the scarecrow win an award? Because he was outstanding in his field!",
  },
  { id:7, role: "user", content: "Haha, I love that one. Thanks for the laughs!" },
  {
    id:8,
    role: "assistant",
    content:
      "You're welcome! I'm glad I could make you laugh. If you have any other questions or need assistance, feel free to ask!",
  },
];

export default function App() {
  const [messageHistory, setMessageHistory] = useState<
    { id: number; role: "user" | "assistant"; content: string }[]
  >([]);
  const [userInput, setUserInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [placeholder, setPlaceholder] = useState<string>(
    "Type your message here...",
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [messageHistory, isLoading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const messageToSend = userInput; // Store the current userInput value before clearing it
    let len = messageHistory.length;
    try {
      setIsLoading(true);
      setUserInput("");
      setMessageHistory((prev) => [
        ...prev,
        { id: prev.length + 1, role: "user", content: messageToSend },
      ]);
      // const data = await sendUserMessage(messageToSend);
      for await (const chunk of sendUserStreamMessage(messageToSend)) {
        setMessageHistory((prev) => {
          const last = prev[prev.length - 1];
          if (last.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { ...last, content: last.content + chunk },
            ]
          }
          return [...prev, { id: prev.length + 1, role: "assistant", content: chunk }];
        });
      }
    } catch (error) {
      console.error("Error sending user message:", error);
      if (error instanceof Error) {
        setPlaceholder(error.message);
      }
      setMessageHistory((prev) => [
        ...prev.slice(0, len),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <div className="bg-taupe-100 min-h-130 aspect-video max-w-4xl rounded-lg drop-shadow-xl border border-taupe-300 flex flex-col">
        <div
          id="header"
          className="flex justify-between items-center mb-4 border-b-2 border-taupe-200 p-3"
        >
          <button className="bg-taupe-200 hover:bg-taupe-300 text-taupe-800 font-bold py-2 px-4 rounded cursor-pointer">
            New Chat
          </button>
          <button className="bg-taupe-200 hover:bg-taupe-300 text-taupe-800 font-bold py-2 px-4 rounded cursor-pointer">
            Delete
          </button>
        </div>
        <div className="flex flex-col p-3 gap-3 h-full ">
          <div className=" contain-content h-85">
            <div
              id="chatbot"
              className=" p-4 size-full text-wrap flex-1 flex flex-col justify-end"
            >
              <div
                className="flex flex-col gap-4 p-2 overflow-auto"
                ref={scrollRef}
              >
                {messageHistory.map((message, index) => (
                  <Message
                    key={index}
                    role={message.role}
                    content={
                      <Markdown>{message.content}</Markdown>
                    }
                  />
                ))}
                {messageHistory[messageHistory.length - 1]?.role === "user" &&
                  isLoading && <Message role="assistant" content={<Loader />} />}
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="w-full flex justify-around">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={placeholder}
              className="border min-w-[80%] p-1 rounded"
            ></input>
            <button
              type="submit"
              className={`bg-taupe-200 hover:bg-taupe-300 text-taupe-800 font-bold py-2 px-4 rounded ${isLoading || userInput.trim() === "" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              disabled={isLoading || userInput.trim() === ""}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
