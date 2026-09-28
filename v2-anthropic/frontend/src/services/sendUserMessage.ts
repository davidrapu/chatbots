const API = import.meta.env.VITE_CHATBOT_API
export default async function sendUserMessage(userMessage:string) : Promise<string>{
    /**
     * Gets a user message and sends a fetch request to the chatbot to then return the results
     * 
     * @param userMessage - The users message
     * @returns The chatbots response
     */
    let response: Response;
    try {
        response = await fetch(`${API}/chat`, {
            headers: {"Content-Type" : "application/json"},
            method: 'POST',
            body: JSON.stringify({message:userMessage})
        })
    } catch {
        throw new Error("Can't reach the assistant right now.")
    }
    
    if (!response.ok) {
        if (response.status === 400) throw new Error('Please type a message')

        if (response.status === 500) throw new Error('Internal Server Error')
    } 

    const data : {response : string} = await response.json()
    return data.response
}