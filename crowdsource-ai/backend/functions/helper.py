import math
from datetime import datetime


def is_within_radius(lat1, lon1, lat2, lon2, radius_m):
    """
    Returns True if the distance between two coordinates is less than or equal to the radius.
    """

    # Convert degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Differences in coordinates
    dlat = lat2 - lat1
    dlon = lon2 - lon1

    # Haversine formula
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = 6371 * c * 1000  # Convert km to meters

    return distance <= radius_m


def get_date_time():
    current_time = datetime.utcnow()

    # Convert time to 12-hour format with AM/PM
    formatted_time = current_time.strftime("%I:%M %p")  # Example: 02:30 PM

    # Convert date to 'dd MMM' format
    formatted_date = current_time.strftime("%d %b")  # Example: 09 Feb

    return formatted_time, formatted_date
