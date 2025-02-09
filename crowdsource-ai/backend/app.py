from flask import Flask, request, jsonify
from flask_cors import CORS
from functions.prompt_template import chat
from functions.get_events import list_events
from database.mongo_db_atlas import get_database
from main import run_main

app = Flask(__name__)
CORS(app)

@app.route("/prompt-data", methods=["POST"])
def prompt_data():
    
    """
    Receives JSON data via POST or query parameters via GET.
    """

    if request.method == "POST":
        data = request.get_json()

    prompt = f"I have the following information in this JSON  \n{data} \n user_latitude and user_longitude give the current location of the user. user_heading gives the current direction in which the user is facing. user_latitude and user_longitude give the current location of the user. user_heading gives the current direction in which the user is facing.  Since the user is describing where the location is in terms of prepositions, make user to account for it. We dont have to calculate in the diagonal direction. We have to ensure that the thing is deducted only from one direction i.e., indicating a straight line. Give me the main event that occurred in a single word, the longitude and latitude of the event, give me a one word status which will show whether this is a create or remove type of event. Give me these details as a JSON with keyword as the key for the event and event_latitude and event_longitude as the keys for the event location and a status field. The status field only haves two values which are create and remove. Create and remove are further used to create an event into database or remove an event from the database. Strictly follow the format: keyword: event, event_latitude: 0.0,event_longitude: 0.0,status:value. Give me no other information."

    if not data:
        return jsonify({"error": "No data received"}), 400
    
    openai_response = chat(prompt)
    openai_response['event_latitude'], openai_response['event_longitude'] = openai_response['event_longitude'], openai_response['event_latitude']
    # print(openai_response)

    # Calling run_main
    run_main(openai_response['event'], openai_response, openai_response['status'])

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