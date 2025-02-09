from flask import Flask, request, jsonify
from flask_cors import CORS
from functions.prompt_template import chat
from functions.get_events import list_events
from functions.get_keywords import get_keywords
from database.mongo_db_atlas import get_database
from main import run_main
import os

app = Flask(__name__)
CORS(app)



@app.route("/prompt-data", methods=["POST"])
def prompt_data():
    
    """
    Receives JSON data via POST or query parameters via GET.
    """

    if request.method == "POST":
        data = request.get_json()

    db = get_database()
    keyword_data = get_keywords(db)
    record = list_events(db)

    prompt = f"""
    I have the following JSON data:  
    {data}  

    - user_latitude and user_longitude represent the user's current location.  
    - user_heading indicates the direction the user is facing.  
    - The user may specify a *distance*; if so, adjust the event’s location accordingly:  
    - If the event is in the *exact location*, use user_latitude and user_longitude directly.  
    - If a distance is mentioned, *add or subtract* it *only in a straight line* (no diagonal movement).  
    - Adjust *latitude* for *north/south* movement and *longitude* for *east/west* movement based on user_heading. 
    - The *main event* is the *most important* event that occurred.
    - The *status* is either "create" or "remove".
    - Use synonyms to the directional instructions if needed.
    - Use synonyms of infront, to the north, to the south, to the east, to the west, behind, to the back, to the left, to the right, to the front, to the back
    - make sure to use any sort of distance mentioned in the data
    
    Output Requirements:  
    - Extract the *main event* that occurred as a *single word*.  
    - Identify the *latitude and longitude* of the event.  
    - Determine the *status* of the event, which is either "create" or "remove".  
    - "create" means adding the event to the database.  
    - "remove" means deleting the event from the database.
    - Make sure the new keyword is used only if the *query* does not match the keyword list from below: 
    {keyword_data}

    Strict JSON Format:  
    {{
    "event": *main event*,
    "event_latitude": user_location+-distance,
    "event_longitude": user_longitude+-distance,
    "status": "value",
    }}

    - Do *not* include any additional information outside this format.  
    - Ensure all values are correctly extracted based on the given data.  

    Return only the JSON output—nothing else.
    """
    if not data:
        return jsonify({"error": "No data received"}), 400
    
    openai_response = chat(prompt)
    openai_response['event_latitude'], openai_response['event_longitude'] = openai_response['event_longitude'], openai_response['event_latitude']
    print(openai_response)

    # Calling run_main
    try: 
        run_main(openai_response['event'], openai_response, openai_response['status'])
    
    except:
        
        return {"message": "Failed",}
    
    

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