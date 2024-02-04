import json

import grid as g
import os
import collect_data as writer
from datetime import datetime, timedelta

FILE_PATH = 'grids.json'
daily_grids = []


def associate_with_time(grids):
    daily_grids = {}
    start_date = datetime.now().date()

    for i, grid in enumerate(grids):
        day = start_date + timedelta(days=i)
        daily_grids[day.isoformat()] = grids[i]
    return daily_grids


def get_daily_game(days_ahead=0):
    global daily_grids
    if not daily_grids:
        with open(FILE_PATH, encoding="utf-8") as f:
            daily_grids = json.load(f)

    current_day = (datetime.now().date() + timedelta(days=days_ahead)).isoformat()
    return daily_grids[current_day]


def get_difficulty_schedule():
    difficulty_schedule = {0: {'forced_categories': ['Weapons'], 'min_solutions': 1},
                           1: {'forced_categories': ['Weapons'], 'min_solutions': 1}}
    # day_values = {
    #     'Monday': {'forced_categories': [], 'min_solutions': 30},
    #     'Tuesday': {'forced_categories': [], 'min_solutions': 25},
    #     'Wednesday': {'forced_categories': [], 'min_solutions': 20},
    #     'Thursday': {'forced_categories': [], 'min_solutions': 10},
    #     'Friday': {'forced_categories': ['Weapons'], 'min_solutions': 10},
    #     'Saturday': {'forced_categories': ['Skills'], 'min_solutions': 5},
    #     'Sunday': {'forced_categories': ['Skills'], 'min_solutions': 1}
    # }
    # start_date = datetime.now().date()
    #
    # for i in range(n):
    #     day = start_date + timedelta(days=i)
    #     difficulty_schedule[i] = {}
    #     difficulty_schedule[i] = day_values[day.strftime("%A")]
    return difficulty_schedule


if __name__ == "__main__":
    grids = []
    n = 7
    difficulty_schedule = get_difficulty_schedule()
    print(difficulty_schedule)
    for i in range(n):
        daily_difficulty = difficulty_schedule[i % 2]
        grids.append(g.make_game(daily_difficulty['min_solutions'],
                                 forced_categories=daily_difficulty['forced_categories'],
                                 show=True,
                                 i=i))
    daily_grids = associate_with_time(grids)

    try:
        os.remove(FILE_PATH)
    except OSError as e:
        pass

    try:
        writer.write(daily_grids, FILE_PATH, return_json=True)
    except Exception as e:
        print(f'Unknown exception: {e}')
