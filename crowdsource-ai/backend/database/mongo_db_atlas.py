from pymongo import MongoClient
import urllib.parse
import os

# Retrieve database credentials from environment variables
mongo_user = os.getenv("MONGO_USER", "23shardul")
mongo_password = os.getenv("MONGO_PASSWORD", "KHdXrMx8NQFfaIP1")

# Encode password properly
encoded_password = urllib.parse.quote_plus(mongo_password)
MONGO_URI = f"mongodb+srv://{mongo_user}:{encoded_password}@cluster0.b2n8z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

def get_database():
    """
    Connects to MongoDB and returns the 'crowdsource' database instance.
    """
    try:
        client = MongoClient(MONGO_URI)
        db = client["crowdsource"]
        print("✅ Connected to MongoDB Atlas!")
        return db
    except Exception as e:
        print("❌ MongoDB Connection Failed:", e)
        return None