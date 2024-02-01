from flask import Flask, render_template
import json
import math
import grid as g

app = Flask(__name__)


# null is a possible JSON value for Special Rarity, which gets converted to python's None,
# which breaks the frontend since it can't access a None property.
# also round the version down to read X.0.
def preprocess(categories, targets):
    for i, target in enumerate(targets):
        if categories[i] == 'Version':
            version = float(target)
            targets[i] = str(float(math.floor(version)))
        elif categories[i] == 'Weapons' or categories[i] == 'Skills':
            targets[i] = g.remove_trailing_symbols(targets[i])
        elif not target:
            targets[i] = 'Normal Pool'


@app.route("/")
def index():
    grid = g.make_game(forced_categories=['Skills'], show=True)
    for key, value in grid.items():
        if isinstance(value, set):
            grid[key] = list(value)

    preprocess(grid['categories'], grid['targets'])

    return render_template('fehdoku.html', grid=grid)


if __name__ == "__main__":
    app.run(port=5000, debug=True)
