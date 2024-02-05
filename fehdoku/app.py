from flask import Flask, render_template
import math
import grid as g
import make_games as mg

app = Flask(__name__)


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


@app.route("/", methods=['GET'])
def index():
    grid = mg.get_daily_game(days_ahead=0)
    constants = mg.get_constant_data()
    for key, value in grid.items():
        if isinstance(value, set):
            grid[key] = list(value)

    preprocess(grid['categories'], grid['targets'])
    grid = grid | constants

    return render_template('fehdoku.html', grid=grid)

@app.route("/past-grids", methods=['GET'])
def past_grids():
    return mg.get_daily_game(days_ahead=1)


if __name__ == "__main__":
    app.run(port=5000, debug=True)
