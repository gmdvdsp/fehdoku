from flask import Flask, render_template
import json
import math
import game

app = Flask(__name__)


# null is a possible JSON value for Special Rarity, which gets converted to python's None,
# which breaks the frontend since it can't access a None property.
# also round the version down to read X.0.
def preprocess(categories, targets):
    for i, target in enumerate(targets):
        if categories[i] == 'Version':
            version = float(target)
            targets[i] = str(float(math.floor(version)))
        elif not target:
            targets[i] = 'Normal Pool'


@app.route("/")
def index():
    grid = game.start()
    for key, value in grid.items():
        if isinstance(value, set):
            grid[key] = list(value)

    preprocess(grid['categories'], grid['targets'])

    return render_template('fehdoku.html', grid=grid)


if __name__ == "__main__":
    app.run(port=5000, debug=True)
