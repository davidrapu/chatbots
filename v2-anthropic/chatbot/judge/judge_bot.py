from pydantic import BaseModel, Field
from typing import Literal
import anthropic
from prompts.judge_system import JUDGE_PROMPT

client = anthropic.AsyncAnthropic()


class ResponseGrade(BaseModel):
    explanation: str = Field(
        description="A brief explanation of why the response was graded as pass or fail, highlighting specific aspects of the assistant's reply that were correct or incorrect according to the expected behaviour."
    )
    grade: Literal["pass", "fail"] = Field(
        description="The grade assigned to the assistant's response, either 'pass' or 'fail'."
    )


async def test_bot_response(
    category: str, expected: str, transcript: str
) -> ResponseGrade:
    judge_input = f"""
    <category>{category}</category>

    <expected_behaviour>
    {expected}
    </expected_behaviour>

    <transcript>
    {transcript}
    </transcript>

    Grade the final ASSISTANT reply in the transcript against the expected behaviour.
    """
    testing_bot_response = await client.messages.parse(
        model="claude-haiku-4-5-20251001",
        messages=[{"role": "user", "content": judge_input}],
        max_tokens=1024,
        system=JUDGE_PROMPT,
        output_format=ResponseGrade,
    )
    grade = testing_bot_response.parsed_output
    if grade is None:
        raise RuntimeError(
            f"Judge returned no grade (stop_reason: {testing_bot_response.stop_reason})"
        )

    return grade
