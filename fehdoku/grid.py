import json
import random
import math
import re

MIN_SOLUTIONS = 1
STAT_THRESHOLDS = 0
CATEGORIES = ['Rarities', 'Special Rarity', 'Weapon', 'Color', 'Move Type', 'Entries', 'Version',
              'HP', 'ATK', 'SPD', 'DEF', 'RES', 'Weapons', 'Assists', 'Specials', 'Skills']

# all the heroes, should refactor
heroes = []
# just the hero names, should refactor
options = []
category_values = {}


def get_grid(categories, targets, solutions):
    grid = {'categories': categories, 'targets': targets, 'solutions': solutions, 'heroes': heroes, 'options': options, 'game': []}

    for i, solution in enumerate(solutions):
        cell = {'index': i, 'categories': {}, 'solutions': solutions[i]}
        # todo: refactor
        if i < 3:
            category_1 = categories[3]
            category_2 = categories[i]
            cell['categories'][category_1] = targets[3]
            cell['categories'][category_2] = targets[i]
        if 3 <= i < 6:
            category_1 = categories[4]
            category_2 = categories[i - 3]
            cell['categories'][category_1] = targets[4]
            cell['categories'][category_2] = targets[i - 3]
        if 6 <= i < 9:
            category_1 = categories[5]
            category_2 = categories[i - 6]
            cell['categories'][category_1] = targets[5]
            cell['categories'][category_2] = targets[i - 6]
        grid['game'].append(cell)
    return grid


def get_solutions_length(grid):
    return [len(solution) for solution in grid['solutions']]


def read_heroes(path):
    with open(path, encoding="utf-8") as f:
        global heroes
        heroes = json.load(f)
        f.close()


def seed_categories_and_options(show=False):
    """ Seed all possible values for a grid clue """
    # bruh
    global options
    options = []

    for category in CATEGORIES:
        category_values[category] = set()

    for hero in heroes:
        options.append(hero['name'])
        for category in CATEGORIES:
            value = hero[category]
            try:
                category_values[category].add(value)
            except Exception as e:
                # value was a list
                for element in value:
                    category_values[category].add(element)

    if show:
        print(options)


def handle_threshold(answer, start, end, thresholds=0):
    return (start + thresholds) <= answer <= (end + thresholds)


def handle_version(answer, version):
    return math.floor(math.floor(answer) == math.floor(version))


def handle_special(answer, value):
    return answer == value


def is_answer(hero, category, target):
    values = hero[category]
    if category in ['HP', 'ATK', 'DEF', 'SPD', 'RES']:
        check = handle_threshold(int(target), int(values[0]), int(values[-1]), thresholds=STAT_THRESHOLDS)
    elif category == 'Version':
        check = handle_version(float(target), float(values))
    elif category == 'Rarity':
        check = handle_threshold(int(target), int(values[0]), int(values[-1]))
    elif category == 'Special Rarity':
        check = handle_special(target, values)
    elif category == 'Weapons' or category == 'Skills':
        check = any(remove_trailing_symbols(target) in value for value in values)
    else:
        check = target in values
    return check


# used to allow for heroes with any version of that skill or weapon
def remove_trailing_symbols(text):
    if text:
        return re.sub(r'[^a-zA-Z]+$', '', text)
    else:
        return None


def get_all_heroes_with_targets(category_1, answer_1, category_2, answer_2):
    ret = []
    # answer_1_stripped, answer_2_stripped = remove_trailing_symbols(answer_1), remove_trailing_symbols(answer_2)
    for hero in heroes:
        check_1, check_2 = is_answer(hero, category_1, answer_1), is_answer(hero, category_2, answer_2)

        if check_1 and check_2:
            ret.append(hero['name'])

    return ret


def get_potential_grid(categories, targets):
    # todo: refactor
    top_left = get_all_heroes_with_targets(categories[0], targets[0], categories[3], targets[3])
    top_mid = get_all_heroes_with_targets(categories[1], targets[1], categories[3], targets[3])
    top_right = get_all_heroes_with_targets(categories[2], targets[2], categories[3], targets[3])
    left = get_all_heroes_with_targets(categories[0], targets[0], categories[4], targets[4])
    mid = get_all_heroes_with_targets(categories[1], targets[1], categories[4], targets[4])
    right = get_all_heroes_with_targets(categories[2], targets[2], categories[4], targets[4])
    bottom_left = get_all_heroes_with_targets(categories[0], targets[0], categories[5], targets[5])
    bottom_mid = get_all_heroes_with_targets(categories[1], targets[1], categories[5], targets[5])
    bottom_right = get_all_heroes_with_targets(categories[2], targets[2], categories[5], targets[5])

    return get_grid(categories, targets, [top_left, top_mid, top_right, left, mid, right, bottom_left, bottom_mid, bottom_right])


def get_targets(categories):
    ret = []
    for category in categories:
        ret.append(random.choice(list(category_values[category])))
    return ret


def get_potential_game(forced_categories):
    if forced_categories is None:
        forced_categories = []
    categories = []

    while not set(forced_categories).issubset(categories):
        random.seed()
        categories = random.sample(CATEGORIES, 6)
    # targets = [random.choice(random.sample(list(category_values[category]), 1)) for category in categories]
    targets = get_targets(categories)

    return get_potential_grid(categories, targets)


def make_game(forced_categories=None, show=False):
    try:
        read_heroes('./heroes_v2.json')
        seed_categories_and_options()

        tries = 0
        while True:
            grid = get_potential_game(forced_categories)

            if all(solution >= MIN_SOLUTIONS for solution in get_solutions_length(grid)):
                break

            if show:
                tries += 1
                print(tries, get_solutions_length(grid))

        return grid
    except OSError:
        pass
