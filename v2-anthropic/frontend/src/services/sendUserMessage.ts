const API = import.meta.env.VITE_CHATBOT_API;
export async function sendUserMessage(userMessage: string): Promise<string> {
  /**
   * Gets a user message and sends a fetch request to the chatbot to then return the results
   *
   * @param userMessage - The users message
   * @returns The chatbots response
   */
  let response: Response;
  try {
    response = await fetch(`${API}/chat`, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ message: userMessage }),
    });
  } catch {
    throw new Error("Can't reach the assistant right now.");
  }

  if (!response.ok) {
    if (response.status === 400) throw new Error("Please type a message");

    if (response.status === 422)
      throw new Error(
        "The message is too long. Please shorten it and try again.",
      );

    if (response.status === 500) throw new Error("Internal Server Error");
  }

  const data: { response: string } = await response.json();
  return data.response;
}
export async function* sendUserStreamMessage(
  userMessage: string,
): AsyncGenerator<string> {
  /**
   * Gets a user message and sends a fetch request to the chatbot to then return the results
   *
   * @param userMessage - The users message
   * @returns The chatbots response
   */
  let response: Response;
  try {
    response = await fetch(`${API}/chat/stream`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      method: "POST",
      body: JSON.stringify({ message: userMessage }),
    });
  } catch {
    throw new Error("Can't reach the assistant right now.");
  }

  if (!response.ok) {
    if (response.status === 400) throw new Error("Please type a message");

    if (response.status === 422)
      throw new Error(
        "The message is too long. Please shorten it and try again.",
      );

    throw new Error("An unknown error occurred.");
  }
  if (!response.body) throw new Error("Pagi didn't reply. Please try again.");
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  while (true) {
    let chunk;
      try {
        chunk = await reader.read();
      } catch {
        // Connection dropped partway: the server failed after streaming had started
        throw new Error("Pagi's reply was interrupted. Please try again.");
      }
    if (!chunk || chunk.done) break;
    yield decoder.decode(chunk.value, { stream: true });
  }
}
