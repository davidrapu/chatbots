


export default function Message({role, content}: {role: "user" | "assistant", content: string | React.ReactNode}) {
  return (
    <div
      className={`flex flex-row gap-2 p-2 ${role === "assistant" ? "bg-white text-taupe-900 border border-taupe-200" : "bg-taupe-700 text-white"} rounded-xl ${role === "user" ? "self-end" : "self-start"}`}
    >
      {role === "assistant" && <span>Pagi: </span>}
      {role === "user" && <span>You: </span>}
      <div>
        {content}
      </div>
    </div>
  );
}
