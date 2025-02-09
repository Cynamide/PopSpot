def get_keywords(db):
    collection = db['icon_keyword']
    # Access the collection named "icon_keyword"
    collection = db['icon_keyword']

    # Query the collection: Only retrieve the "keword" field and exclude the "_id" field
    keyword_values = collection.find({}, {'keyword': 1, '_id': 0})

    # Extract the "keword" values from each document
    keyword_list = [item['keyword'] for item in keyword_values if 'keyword' in item]

    # Print the list of values
    return keyword_list