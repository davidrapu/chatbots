from typing import TypedDict, Literal
from tests.test_cases import test_cases
from bots.bot import get_response
from judge.judge_bot import test_bot_response
from anthropic.types import MessageParam
import asyncio

class GradingData(TypedDict):
    id: int
    category: str
    expected: str
    transcript: str

grading_data: list[GradingData] = []


with open("test_results.txt", "w", encoding='utf-8') as f:
    for test_case in test_cases:
        history : list[MessageParam] = []
        for turn in test_case["turns"]:
            history.append({"role": "user", "content": turn})
            response = asyncio.run(get_response(history))
            history.append({"role": "assistant", "content": response})
        expected = test_case["expected"]
        transcript = "\n".join([f"{info['role']}: {info['content']}" for info in history])
        grading_data.append({
            "id": test_case["id"],
            "category": test_case["category"],
            "expected": expected,
            "transcript": transcript
        })
        f.write(f"ID: {test_case['id']}\n")
        f.write(f"Category: {test_case['category']}\n")
        f.write(f"Expected: {expected}\n")
        f.write(f"Total Response:\n{transcript}\n")
        f.write("\n")

    with open("grading_results.txt", "w", encoding='utf-8') as f:
        for data in grading_data:
            f.write(f"ID: {data['id']}\n")
            grade = asyncio.run(test_bot_response(data["category"], data["expected"], data["transcript"]))
            f.write(f"Category: {data['category']}\n")
            f.write(f"Expected: {data['expected']}\n")
            f.write(f"Grade: {grade.grade}\n")
            f.write(f"Explanation: {grade.explanation}\n")
            f.write("\n")