import json
import random
import math

MIN_SOLUTIONS = 5
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
    return start + thresholds <= answer <= end + thresholds


def handle_version(answer, version):
    return math.floor(math.floor(answer) == math.floor(version))


def handle_special(answer, value):
    return answer == value


def is_answer(hero, category, target):
    value = hero[category]
    if category in ['HP', 'ATK', 'DEF', 'SPD', 'RES']:
        check = handle_threshold(int(target), int(value[0]), int(value[-1]), thresholds=STAT_THRESHOLDS)
    elif category == 'Version':
        check = handle_version(float(target), float(value))
    elif category == 'Rarity':
        check = handle_threshold(int(target), int(value[0]), int(value[-1]))
    elif category == 'Special Rarity':
        check = handle_special(target, value)
    else:
        check = target in value
    return check


def get_all_answers(category_1, answer_1, category_2, answer_2):
    ret = []
    for hero in heroes:
        check_1, check_2 = is_answer(hero, category_1, answer_1), is_answer(hero, category_2, answer_2)

        if check_1 and check_2:
            ret.append(hero['name'])

    return ret


def get_potential_grid(categories, answers):
    # todo: refactor
    top_left = get_all_answers(categories[0], answers[0], categories[3], answers[3])
    top_mid = get_all_answers(categories[1], answers[1], categories[3], answers[3])
    top_right = get_all_answers(categories[2], answers[2], categories[3], answers[3])
    left = get_all_answers(categories[0], answers[0], categories[4], answers[4])
    mid = get_all_answers(categories[1], answers[1], categories[4], answers[4])
    right = get_all_answers(categories[2], answers[2], categories[4], answers[4])
    bottom_left = get_all_answers(categories[0], answers[0], categories[5], answers[5])
    bottom_mid = get_all_answers(categories[1], answers[1], categories[5], answers[5])
    bottom_right = get_all_answers(categories[2], answers[2], categories[5], answers[5])

    return get_grid(categories, answers,[top_left, top_mid, top_right, left, mid, right, bottom_left, bottom_mid, bottom_right])


def get_potential_game():
    random.seed()
    categories = random.sample(CATEGORIES, 6)
    answers = [random.choice(random.sample(list(category_values[category]), 1)) for category in categories]

    return get_potential_grid(categories, answers)


def make_game(show=False):
    try:
        read_heroes('./heroes_v1.json')
        seed_categories_and_options()

        while True:
            grid = get_potential_game()

            if all(solution >= MIN_SOLUTIONS for solution in get_solutions_length(grid)):
                break

        if show:
            print(grid)

        return grid
    except OSError:
        pass
