from flask import Flask, request, jsonify
from flask_cors import CORS
from functions.prompt_template import chat
from functions.get_events import list_events
from database.mongo_db_atlas import get_database

app = Flask(__name__)
CORS(app)

@app.route("/prompt-data", methods=["POST"])
def prompt_data():
    """
    Receives JSON data via POST or query parameters via GET.
    """
    if request.method == "POST":
        data = request.get_json()
    else:  # Handle GET request (for browser testing)
        data = {
            "latitude": request.args.get("latitude", type=float),
            "longitude": request.args.get("longitude", type=float),
            "heading": request.args.get("heading", type=int),
            "query": request.args.get("query", default="No query provided", type=str)
        }

    prompt = f'I have the following information in this JSON  \n{data} \n user_latitude and user_longitude give the current location of the user. user_heading gives the current direction in which the user is facing. user_latitude and user_longitude give the current location of the user. user_heading gives the current direction in which the user is facing.  Since the user is describing where the location is in terms of prepositions, make user to account for it. We dont have to calculate in the diagonal direction. We have to ensure that the thing is deducted only from one direction i.e., indicating a straight line. Give me the main event that occurred in a single word, the longitude and latitude of the event. Give me these details as a JSON with "keyword" as the key for the event and event_latitude and event_longitude as the keys for the event location. Strictly follow the format: keyword: event, event_latitude: 0.0,event_longitude: 0.0. Give me no other information.'

    # print(prompt)

    if not data:
        return jsonify({"error": "No data received"}), 400
    
    openai_response = chat(prompt)


    return {
        "message": "Success",
    }

@app.route("/get-events", methods=["GET"])
def get_events():
    db = get_database()

    record = list_events(db)

    return {
        "message": record,
    }

if __name__ == "__main__":
    app.run(debug=True, port=5000)