from flask import Flask, json, request
from flask_cors import CORS

api = Flask(__name__)
cors = CORS(api, resources={r"*": {"origins": "*"}})


@api.route("/", methods=["GET", "POST"])
def get_scene():
    if request.method == "GET":
        """Give the scene data to the user"""
        movies = None
        with open("movies.json", "r") as f:
            movies = json.load(f)

        return json.dumps(movies)

    if request.method == "POST":
        """Update the movies"""
        movies_str = request.data.decode("utf-8")

        if movies_str == "":
            return json.dumps({"error": "400 - Missing data"}), 400

        movies = None
        try:
            movies = json.loads(movies_str)
        except:
            return json.dumps({"error": "400 - Could not parse json data"}), 400

        # TODO: Validate the json after loading it

        with open("movies.json", "w") as f:
            movies = json.dump(movies, f, indent=4, sort_keys=False)

        return json.dumps({"success": "202 - movies updated"}), 201

    else:
        return json.dumps({"error": "405 - Method not allowed"}), 405


if __name__ == "__main__":
    api.run(host="localhost", port=5001, debug=True)
