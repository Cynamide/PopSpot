from datetime import datetime


def get_static_event_details(curr_location, keyword):
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
        "name": keyword,
        "summary": "Sample event generated after SVG creation.",
        "time": formatted_time,  # Store time separately in 12-hour format
        "date": formatted_date,  # Store date in 'dd MMM' format
        "location": {
            "type": "Point",
            "coordinates": curr_location,
        },
    }


def store_event(db, location_keyword):
    """
    Stores the event in the 'events' collection and returns the inserted document.
    """
    # db = get_database()
    if db is None:
        print("❌ Database connection failed. Cannot store event.")
        return None

    events_collection = db["events"]
    results = events_collection.find(
        {}, {"name": 1, "location": 1, "_id": 0}
    )  # TODO: add users into this query for ++
    existing_events = [result for result in results]

    curr_location = [
        location_keyword["event_latitude"],
        location_keyword["event_longitude"],
    ]
    keyword = location_keyword["keyword"]

    event_exists = False

    for event in existing_events:
        if (
            event["name"] == keyword
            and event["location"]["coordinates"] == curr_location
        ):
            print(
                f"❌ Event for keyword '{location_keyword['keyword']}' already exists in the database."
            )
            event_exists = True
            break

    if event_exists:
        return None
    else:
        event_document = get_static_event_details(curr_location, keyword)
        result = events_collection.insert_one(event_document)
        print(f"✅ Event stored successfully with ID: {result.inserted_id}")
        return result.inserted_id


if __name__ == "__main__":
    store_event()
