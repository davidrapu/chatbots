import json

import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic()


def chat(user_input):
    try:
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1024,
            system="You are a helpful assistant that classifies user messages about their spending into a structured JSON format. You are only able to classify messages about spending.",
            messages=[{"role": "user", "content": user_input}],
            output_config={
                "format": {
                    "type": "json_schema",
                    "schema": {
                        "type": "object",
                        "properties": {
                            "expenses": {
                                "type": "array",
                                "description": "List of expenses extracted from the user message, each with a description, amount, and category.",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "description": {
                                            "type": "string",
                                            "description": "Short detailed label for what was bought, 2-5 words, lowercase, no amounts or prices. E.g. 'suya and drinks', 'uber to VI', 'uber back from VI'.",
                                        },
                                        "amount": {
                                            "type": "number",
                                            "description": "Amount spent in Naira, as a number. E.g. 5000, 3200, 15000. 3k should be converted to 3000, 2.5k to 2500, etc. Omit this field if no amount is stated. Never use 0 for an unknown amount.",
                                        },
                                        "category": {
                                            "type": "string",
                                            "enum": [
                                                "food",
                                                "transport",
                                                "bills",
                                                "shopping",
                                                "entertainment",
                                                "other",
                                            ],
                                        },
                                    },
                                    "required": ["description", "category"],
                                    "additionalProperties": False,
                                },
                            }
                        },
                        "required": ["expenses"],
                        "additionalProperties": False,
                    },
                }
            },
        )
        text = "".join(block.text for block in message.content if block.type == "text")
        structured_response = json.loads(text)
        return structured_response
    except (json.JSONDecodeError, anthropic.APIError):
        return None


messages = [
    "spent 5k on suya and drinks with the guys",
    "uber 3,200 to VI then 2500 back",
    "paid nepa bill 15000",
    "bought shoes for 22,500 and a belt for 4k at the mall",
    "bought Shoes for 22,500 and lunch for 3k",
    "netflix subscription",
    "movie tickets 2 x 3500",
    "remind me to call mum tomorrow",
    "gave my brother 10k for his school fees",
    "spent 2k on data and 1k on airtime",
]
# response = chat(messages[4])
# print(response['expenses'])
categories_totals = {}

for msg in messages:
    response = chat(msg)

    if response is None:
        continue
    if response["expenses"] is None or len(response["expenses"]) < 1:
        continue
    for expense in response["expenses"]:
        category = expense["category"]
        amount = expense.get("amount", 0) or 0
        if category in categories_totals:
            categories_totals[category] += amount
        else:
            categories_totals[category] = amount
        # print(f"Expense: {expense}\nCategory: {category}, Amount: {amount}\nCurrent totals: {categories_totals}\n\n")
total_spending = sum(categories_totals.values())
print(f"Total spending: {total_spending}")
print("Total spending by category:")
print(categories_totals)
