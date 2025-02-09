import os
import openai
import re

import dotenv

dotenv.load_dotenv()  # Load environment variables from .env file



api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=api_key)

# if not api_key:
#     raise ValueError(
#         "❌ API key not found. Set OPENAI_API_KEY as an environment variable."
#     )


def generate_svg_icon(keyword: str) -> str:
    """
    Generates an SVG icon for a given keyword using OpenAI's API.

    Args:
        keyword (str): The type of icon to generate (e.g., "fire", "pothole", "party").

    Returns:
        str: SVG markup string of the generated icon.

        # The icons should be realistic, recognizable, visually appealing, with a circular background,"
        "and complete for medium-scale display.  Ensure consistency across different icons.
    """

    system_prompt = (
        "You are an SVG image generator that creates simple, standardized 50x50 pixel icons."
        "Return only the SVG code without explanations or extra text."
    )

    user_prompt = f"Generate a simple 50x50 SVG icon representing realistic '{keyword}' doodle as a marker for a custom map without the keyword text in it."

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )

        response_text = response.choices[0].message.content.strip()

        # Extract only the SVG code using regex
        match = re.search(r"<svg[\s\S]*?</svg>", response_text, re.MULTILINE)
        if match:
            return match.group(0)
        else:
            raise ValueError("❌ Invalid SVG response received.")
    except openai.error.OpenAIError as e:
        print(f"❌ Error generating SVG icon: {e}")
        return ""


if __name__ == "__main__":
    print(generate_svg_icon("party"))
