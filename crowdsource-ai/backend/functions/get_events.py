def list_events(db):
    record = []
    # collections = db["events"]
    # icons = db["icon_keyword"]

    # for document in collections.find():
        # record["_id"] = {'name': document['name'], 'time': document['time'], 'latitude': document['location']['coordinates'][0], 'longitude': document['location']['coordinates'][1], 'icon': icons[document['name']]}
    
    collection = db["events"]

    pipeline = [
        {
            "$lookup": {
                "from": "icon_keyword",  # The collection to join with
                "localField": "name",  # Field in 'events'
                "foreignField": "keyword",  # Field in 'icons'
                "as": "icon_data"  # Store matched results in 'icon_data'
            }
        },
        {
            "$unwind": {
                "path": "$icon_data",
                "preserveNullAndEmptyArrays": True  # Keep events even if no match is found
            }
        },
        {
            "$project": {
                "_id": { "$toString": "$_id" },
                "name": 1,  # Event name
                "summary": 1,
                "time": 1,
                "date": 1,
                "location": 1,
                "reported_by_users": 1,
                "icon": "$icon_data.icon"  # Extract the icon field
            }
        }
    ]

    results = list(collection.aggregate(pipeline))  # Run aggregation query

    for result in results:
        temp = {"_id": result["_id"], "name": result["name"], "timestamp": [result["time"], result['date']], "location": result['location'], "reported_by_users": result["reported_by_users"], "icon": result["icon"]}
        record.append(temp)

    return record

        

    # return f"{record}"