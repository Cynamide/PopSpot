from datetime import datetime
from database.mongo_db_atlas import get_database

def get_static_event_details():
    """
    Returns static event details such as summary, time (hh:mm AM/PM format), 
    and date (dd MMM format).
    """
    current_time = datetime.utcnow()
    
    # Convert time to 12-hour format with AM/PM
    formatted_time = current_time.strftime("%I:%M %p")  # Example: 02:30 PM
    
    # Convert date to 'dd MMM' format
    formatted_date = current_time.strftime("%d %b")  # Example: 09 Feb

    return {
        "summary": "Sample event generated after SVG creation.",
        "time": formatted_time,  # Store time separately in 12-hour format
        "date": formatted_date,  # Store date in 'dd MMM' format
        "location": {
            "type": "Point",
            "coordinates": [-122.4194, 37.7749]  # Example coordinates (San Francisco)
        }
    }

def insert_event(keyword):
    """
    Inserts an event into the 'events' collection using the given keyword and ensures 
    that the corresponding icon exists in the 'icon_keyword' collection.
    
    Args:
        keyword (str): The keyword corresponding to the icon.
    
    Returns:
        dict: The inserted event document or None if the icon is not found.
    """
    db = get_database()
    if db is None:
        print("❌ Database connection failed. Cannot insert event.")
        return None
    
    events_collection = db["events"]
    
    # Get event details
    event_details = get_static_event_details()
    event_document = {
        "name": keyword,  # Foreign key reference
        **event_details
    }
    
    # Insert into events collection
    result = events_collection.insert_one(event_document)
    event_document["_id"] = result.inserted_id  # Add inserted ID to return document
    print(f"✅ Event inserted successfully with ID: {result.inserted_id}")
    
    return event_document
