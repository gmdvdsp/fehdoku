from flask import Flask, render_template
import json
import game

app = Flask(__name__)

@app.route("/")
def index():
    grid = game.start()
    for key, value in grid.items():
        if isinstance(value, set):
            grid[key] = list(value)
    # print(len(grid['heroes']))
    return render_template('fehdoku.html', grid=grid)


if __name__ == "__main__":
    app.run(port=5000, debug=True)