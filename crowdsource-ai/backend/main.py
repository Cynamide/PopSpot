from functions.generate_image import generate_svg_icon
from database.mongo_db_atlas import get_database

def store_icon_in_db(keyword):
    """
    Generates an SVG icon for the given keyword and stores it in MongoDB.

    Args:
        keyword (str): The keyword for the icon.
    """
    db = get_database()
    if db is None:
        print("Database connection failed. Cannot proceed.")
        return

    collection = db["icon_keyword"]

    # Generate SVG icon
    svg_icon = generate_svg_icon(keyword)
    if not svg_icon:
        print("Failed to generate SVG icon.")
        return

    # Create document
    document = {
        "icon": svg_icon,
        "keyword": keyword
    }

    # Insert into MongoDB
    result = collection.insert_one(document)
    print(f"✅ Icon stored successfully with ID: {result.inserted_id}")

if __name__ == "__main__":
    keyword = "party"  # Example keyword
    store_icon_in_db(keyword)