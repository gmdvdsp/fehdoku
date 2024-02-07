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


def get_user_daily_game(user_id, date):
    # If the game does not exist, make an empty one, or else return that game.
    try:
        ret = games[user_id][date]
        return {date: ret}
    except Exception as e:
        grid = mg.get_daily_game(days_ahead=0)
        ret = {date: {'guesses': [{'correct': None, 'incorrect': []} for _ in range(9)],
                       'grid': grid,
                       'guessesLeft': 9,
                       'score': 0}}
        return ret


@app.route("/", methods=['GET'])
def index():
    # Check if cookies exist.
    user_id = request.cookies.get('user_id')
    if user_id is None:
        user_id = str(uuid.uuid4())
    if user_id not in games:
        games[user_id] = {}

    # Get the user's daily game.
    today = datetime.now().date().isoformat()
    daily_game = get_user_daily_game(user_id, today)
    grid = daily_game[today]['grid']
    constants = mg.get_constant_data()

    for key, value in grid.items():
        if isinstance(value, set):
            grid[key] = list(value)

    preprocess(grid['categories'], grid['targets'])

    print(daily_game)
    resp = make_response(render_template('fehdoku.html', date=today, game=daily_game, constants=constants))
    # resp.delete_cookie('user_id')
    resp.set_cookie('user_id', user_id)

    return resp


@app.route("/past-grids/<date>/<days_back>", methods=['GET'])
def past_grids(date, days_back):
    # Assumes the user has cookies.
    user_id = request.cookies.get('user_id')
    today = datetime.fromisoformat(date).date()
    target_day = (today + timedelta(days=int(days_back) * -1)).isoformat()
    target_game = get_user_daily_game(user_id, target_day)
    print(target_game)
    return jsonify({'success': True, 'data': target_game})


@app.route("/update-game/<day>", methods=['POST'])
def update_game(day):
    # Assumes the user has cookies.
    user_id = request.cookies.get('user_id')
    json_data = request.get_json()
    games[user_id][day] = json_data[day]
    print(games[user_id][day])
    return jsonify(success=True)


if __name__ == "__main__":
    app.run(port=5000, debug=True)
