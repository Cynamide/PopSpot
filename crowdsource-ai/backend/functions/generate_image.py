import os
from openai import OpenAI

client = OpenAI(api_key=api_key) 

# Load API key from environment variable
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise ValueError("API key not found. Set OPENAI_API_KEY as an environment variable.")


response = client.chat.completions.create(model="gpt-4",
messages=[{"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": "Hello, how are you?"}])

print(response.choices[0].message.content)