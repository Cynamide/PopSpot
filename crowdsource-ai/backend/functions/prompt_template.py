import openai
import os
import json
import re

import dotenv

dotenv.load_dotenv()  # Load environment variables from .env file



api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=api_key)

# print(OPENAI_API_KEY)

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

