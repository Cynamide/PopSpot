import os
import openai

api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=api_key)

# Load API key from environment variable
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise ValueError(
        "API key not found. Set OPENAI_API_KEY as an environment variable."
    )


# response = client.chat.completions.create(
#     model="gpt-4o-mini",
#     messages=[
#         {"role": "system", "content": "You are a helpful assistant."},
#         {"role": "user", "content": "Hello, how are you?"},
#     ],
# )

# print(response.choices[0].message.content)

def generate_svg_icon(keyword: str) -> str:
    """
    Generates an SVG icon for a given keyword using OpenAI's API.

    Args:
        keyword (str): The type of icon to generate (e.g., "fire", "pothole", "party").

    Returns:
        str: SVG markup string of the generated icon.
    """

    system_prompt = (
        "You are an SVG image generator that creates simple, standardized 50x50 pixel icons "
        "for a custom mapping application. The icons should be recognizable, visually appealing, with a circular background,"
        "and complete for medium-scale display. Ensure consistency across different icons. "
        "Return only the SVG code without explanations or extra text."
    )

    user_prompt = f"Generate a simple 50x50 SVG icon representing '{keyword}' as a marker for a custom map without the keyword text in it."

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ]
        )

        svg_code = response.choices[0].message.content.strip()
        
        # Basic validation to check if the response contains valid SVG tags
        if "<svg" in svg_code and "</svg>" in svg_code:
            return svg_code
        else:
            raise ValueError("Invalid SVG response received.")

    except openai.error.OpenAIError as e:
        print(f"Error generating SVG icon: {e}")
        return ""


print(generate_svg_icon("party"))
