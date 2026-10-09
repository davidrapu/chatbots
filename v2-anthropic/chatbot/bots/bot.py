import anthropic
from anthropic.types import MessageParam
from prompts.main_system import SYSTEM_PROMPT


from dotenv import load_dotenv

load_dotenv()

client = anthropic.AsyncAnthropic()

async def get_response(history: list[MessageParam]) -> str:
    response = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        messages=history,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
    )

    return "".join(block.text for block in response.content if block.type == "text")


async def get_streaming_response(history: list[MessageParam]):

    async with client.messages.stream(
        model="claude-haiku-4-5-20251001",
        messages=history,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
    ) as stream:
        async for text in stream.text_stream:
            yield text


# if __name__ == "__main__":
#     print(asyncio.run(get_response("Hello, how can I help you today?")))
