# from database.mongo_db_atlas import get_database
# from database.insert_events import insert_event
from functions.generate_image import generate_svg_icon


def store_icon(db, keyword):
    """
    Generates an SVG icon for the given keyword, stores it in MongoDB,
    and then creates an event entry using the same keyword.

    Args:
        keyword (str): The keyword for the icon.

    Returns:
        dict: The inserted event document.
    """
    # db = get_database()
    if db is None:
        print("❌ Database connection failed. Cannot proceed.")
        return None

    collection = db["icon_keyword"]

    results = collection.find({}, {"keyword": 1, "_id": 0})
    existing_keywords = [result["keyword"] for result in results]
    if keyword in existing_keywords:
        print(f"❌ Icon for keyword '{keyword}' already exists in the database.")
        return None
    else:
        # Generate SVG icon
        svg_icon = generate_svg_icon(keyword)
        if not svg_icon:
            print("❌ Failed to generate SVG icon.")
            return None

        # Create document
        document = {"icon": svg_icon, "keyword": keyword}

        # Insert into MongoDB
        result = collection.insert_one(document)
        print(f"✅ Icon stored successfully with ID: {result.inserted_id}")
        return result.inserted_id
