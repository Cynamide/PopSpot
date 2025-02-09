from typing import Optional, Dict, Any
from database.mongo_db_atlas import get_database

# from database.insert_events import insert_event
from functions.generate_image import generate_svg_icon
from functions.store_event import store_event
from functions.store_icon import store_icon
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def store_icon_and_event(db: Any, keyword: str, location_keyword: Dict):
    """Store icon and related event in the database."""
    try:
        icon_status = store_icon(db, keyword)

        event_status = store_event(db, location_keyword)

        return {
            "icon_id": icon_status,
            "event_id": event_status,
            "status": "Success" if icon_status or event_status else "Failed",
        }
    except Exception as e:
        logger.exception("Error in store_icon_and_event: %s", str(e))
        return None


def run_main(keyword: str, location_keyword: dict) -> Dict[str, Any]:
    """Main pipeline execution with proper resource handling."""
    try:
        db = get_database()
        if db is None:
            logger.error("Failed to establish database connection")
            return {"status": "error", "message": "Database connection failed"}

        result = store_icon_and_event(db, keyword, location_keyword)
        return {
            "data": result,
            "keyword": keyword,
        }
    except Exception as e:
        logger.exception("Critical error in run_main: %s", str(e))
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    # Example usage
    # location_keyword = {
    #     "keyword": "celebrate",
    #     "event_latitude": -122.4194,
    #     "event_longitude": 37.7748
    # }

    location_keyword = {
        "keyword": "new_event",
        "event_latitude": -122.5,
        "event_longitude": 38,
    }
    keyword = location_keyword["keyword"]
    result = run_main(keyword, location_keyword)
    print(f"Execution result for '{keyword}':")
    print(result)
