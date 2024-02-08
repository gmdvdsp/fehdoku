import json
import os
import uuid
from datetime import datetime, timedelta

import logging
from flask import Flask, request, render_template, make_response, jsonify
import math
import grid as g
import make_games as mg
from collect_data import write

app = Flask(__name__)
logging.getLogger('werkzeug').disabled = True

games = {}

FILE_PATH = 'games.json'


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


def get_user_game(user_id, date):
    try:
        ret = games[user_id][date]
        return {date: ret}
    except KeyError:
        grid = mg.get_daily_game(days_ahead=0)
        initial_game_state = {'guesses': [{'correct': None, 'incorrect': []} for _ in range(9)],
                              'grid': grid,
                              'guessesLeft': 9,
                              'score': 0}
        ret = {date: initial_game_state}
        return ret


def get_user_id():
    user_id = request.cookies.get('user_id')
    if user_id is None:
        user_id = str(uuid.uuid4())
    if user_id not in games:
        games[user_id] = {}
    return user_id


def render_game(user_id, initial_date, date, game):
    constants = mg.get_constant_data()
    resp = make_response(render_template('fehdoku.html',
                                         initial_date=initial_date,
                                         date=date,
                                         game=game,
                                         constants=constants))
    resp.set_cookie('user_id', user_id, max_age=31536000)  # One year in seconds.
    return resp


def load_database():
    global games
    if not games:
        try:
            with open(FILE_PATH, encoding="utf-8") as f:
                games = json.load(f)
                f.close()
                print('Database loaded.')
        except OSError:
            print('No database exists.')
            pass


@app.route("/", methods=['GET'])
def index():
    # If there isn't an in-memory object database yet, go load it from the JSON. Else, leave it alone.
    load_database()

    user_id = get_user_id()

    # Get the user's daily game.
    today = datetime.now().date().isoformat()
    daily_game = get_user_game(user_id, today)

    # Preprocess the categories and targets for readability.
    grid = daily_game[today]['grid']
    for key, value in grid.items():
        if isinstance(value, set):
            grid[key] = list(value)
    preprocess(grid['categories'], grid['targets'])

    return render_game(user_id, today, today, daily_game)


@app.route("/dates", methods=['GET'])
def get_user_dates():
    user_id = get_user_id()

    user_games = games[user_id]
    return jsonify({'success': True, 'data': [date for date in user_games]})


@app.route("/show-game/<initial_date>/<date>", methods=['GET'])
def show_game(initial_date, date):
    user_id = get_user_id()

    target_game = get_user_game(user_id, date)
    return render_game(user_id, initial_date, date, target_game)


@app.route("/past-grids/<date>/<days_back>", methods=['GET'])
def get_past_grids(date, days_back):
    user_id = get_user_id()

    today = datetime.fromisoformat(date).date()
    target_day = (today + timedelta(days=int(days_back) * -1)).isoformat()
    target_game = get_user_game(user_id, target_day)
    # print(target_game)
    return jsonify({'success': True, 'key': target_day, 'data': target_game})


@app.route("/update-game/<day>", methods=['POST'])
def update_game(day):
    user_id = get_user_id()

    json_data = request.get_json()
    games[user_id][day] = json_data[day]
    print(games[user_id][day])
    return jsonify(success=True)


if __name__ == "__main__":
    try:
        app.run(port=5000, debug=False)
    finally:
        try:
            os.remove(FILE_PATH)
        except OSError:
            # Silently fails, because this will hit every time the app refreshes.
            pass
        write(games, FILE_PATH, return_json=True)
        print('Database write finished.')
