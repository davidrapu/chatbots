import { useState } from "react";
import sendUserMessage from "./services/sendUserMessage";

export default function App() {
  const [userInput, setUserInput] = useState<string>("");
  const [chatbotResponse, setChatbotResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const data = await sendUserMessage(userInput);
    setIsLoading(false);
    setChatbotResponse(data);
    setUserInput("");
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
        <div className="flex flex-col p-3 h-full ">
          <div
            id="chatbot"
            className="border rounded-lg p-4 mb-4 w-full text-wrap flex-1 bg-stone-50"
          >
            <div className="flex flex-row gap-2 items-center">
              <p>Pagi: {chatbotResponse}</p>
              <div className={`flex flex-row gap-1 ${isLoading ? "visible" : "invisible"}`}>
              <div className="animate-bounce [animation-delay:0ms] font-extrabold text-xl">.</div>
              <div className="animate-bounce [animation-delay:100ms] font-extrabold text-xl">.</div>
              <div className="animate-bounce [animation-delay:200ms] font-extrabold text-xl">.</div>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="w-full flex justify-around">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message here..."
              className="border min-w-[80%] p-1 rounded"
            ></input>
            <button
              type="submit"
              className="bg-taupe-200 hover:bg-taupe-300 text-taupe-800 font-bold py-2 px-4 rounded cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
