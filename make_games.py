import json

import grid as g
import os
from collect_data import write
from datetime import datetime, timedelta

FILE_PATH = 'grids.json'
daily_grids = {}


def associate_with_time(grids, days_ahead=0):
    daily_grids = {}
    start_date = datetime.now().date() + timedelta(days=days_ahead)

    for i, grid in enumerate(grids):
        day = start_date + timedelta(days=i)
        daily_grids[day.isoformat()] = grids[i]
    return daily_grids


def get_daily_game(date):
    global daily_grids
    if not daily_grids:
        try:
            with open(FILE_PATH, encoding="utf-8") as f:
                daily_grids = json.load(f)
        except OSError as e:
            print(f'Failed reading daily grids: {e}')

    return daily_grids[date]


def get_difficulty_schedule():
    difficulty_schedule = {0: {'forced_categories': ['Weapons'], 'min_solutions': 1},
                           1: {'forced_categories': ['Skills'], 'min_solutions': 1}}
    return difficulty_schedule


def get_constant_data():
    return g.get_constants()


if __name__ == "__main__":
    grids = []
    n = 365
    difficulty_schedule = get_difficulty_schedule()
    for i in range(n):
        daily_difficulty = difficulty_schedule[i % 2]
        grid = g.make_game(daily_difficulty['min_solutions'],
                           forced_categories=daily_difficulty['forced_categories'],
                           show=True,
                           i=i)
        grid['id'] = i
        grids.append(grid)
    daily_grids = associate_with_time(grids, days_ahead=-7)

    try:
        os.remove(FILE_PATH)
    except OSError as e:
        pass

    write(daily_grids, FILE_PATH, return_json=True)
