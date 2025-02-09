import openai
import os
import json
import re

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
# print(OPENAI_API_KEY)
client = openai.OpenAI(api_key="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")

def chat(prompt):
    """
    Calls OpenAI's GPT-4o model and prints the response.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Change model if needed
            messages=[{"role": "user", "content": prompt}]
        )

        ai_response = response.choices[0].message.content
        ai_response = re.sub(r"```json\n|\n```", "", ai_response).strip()
        return json.loads(ai_response)

    except Exception as e:
        print("Error calling OpenAI:", e)
        return None 

