import json
import uuid
from datetime import datetime, timedelta

from flask import Flask, request, render_template, make_response, jsonify
import math
import grid as g
import make_games as mg

app = Flask(__name__)

games = {}


def preprocess(categories, targets):
    for i, target in enumerate(targets):
        if categories[i] == 'Version':
            version = float(target)
            targets[i] = str(float(math.floor(version)))
        elif categories[i] == 'Weapon':
            categories[i] = 'Weapon Type'
        elif categories[i] == 'Weapons' or categories[i] == 'Skills':
            targets[i] = g.remove_trailing_symbols(targets[i])
        elif categories[i] == 'Entries':
            categories[i] = 'Entry'
        elif target == 'New':
            targets[i] = 'New Mystery of the Emblem'
        elif target == 'Mystery':
            targets[i] = 'Mystery of the Emblem'
        elif not target:
            targets[i] = 'Normal Pool'


def get_user_daily_game(user_id):
    # If the game does not exist, make an empty one, or else return that game.
    today = datetime.now().date().isoformat()
    try:
        ret = games[user_id][today]
        return today, {today: ret}
    except Exception as e:
        grid = mg.get_daily_game(days_ahead=0)
        ret = {today: {'guesses': [{'correct': None, 'incorrect': []} for _ in range(9)],
                       'grid': grid,
                       'guessesLeft': 9,
                       'score': 0}}
        return today, ret


@app.route("/", methods=['GET'])
def index():
    # Check if cookies exist.
    user_id = request.cookies.get('user_id')
    if user_id is None:
        user_id = str(uuid.uuid4())
    if user_id not in games:
        games[user_id] = {}

    # Get the user's daily game.
    today, daily_game = get_user_daily_game(user_id)
    grid = daily_game[today]['grid']
    constants = mg.get_constant_data()
    daily_game[today]['grid'] = grid | constants

    for key, value in grid.items():
        if isinstance(value, set):
            grid[key] = list(value)

    preprocess(grid['categories'], grid['targets'])

    print(today)
    resp = make_response(render_template('fehdoku.html', date=today, game=daily_game))
    # resp.delete_cookie('user_id')
    resp.set_cookie('user_id', user_id)

    return resp


@app.route("/past-grids", methods=['GET'])
def past_grids():
    return request.cookies.get('user_id')


@app.route("/update-game/<day>", methods=['POST'])
def update_game(day):
    # Assumes the user has cookies.
    user_id = request.cookies.get('user_id')
    json_data = request.get_json()
    # print(request.get_json()[day]['guesses'])
    try:
        games[user_id][day] = request.get_json()[day]
    except Exception as e:
        games[day] = {}
        games[user_id][day] = json_data
    return jsonify(success=True)


if __name__ == "__main__":
    app.run(port=5000, debug=True)
