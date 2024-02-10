import json
import random
import math
import re
import time

MIN_SOLUTIONS = 1
STAT_THRESHOLDS = 0
CATEGORIES = ['Rarities', 'Special Rarity', 'Weapon', 'Color', 'Move Type', 'Entries', 'Version',
              'HP', 'ATK', 'SPD', 'DEF', 'RES', 'Weapons', 'Assists', 'Specials', 'Skills']

# all the heroes, should refactor
heroes = []
# just the hero names, should refactor
options = []
category_values = {}


def get_constants():
    global heroes
    if not heroes:
        read_heroes('./heroes_v2.json')

    # Return the minimum constant information for the frontend: the names and images, keyed by name.
    constants = {'heroes': {}}
    for hero in heroes:
        constants['heroes'][hero['name']] = hero['image']
    return constants


def get_grid(categories, targets, solutions):
    grid = {'categories': categories,
            'targets': targets,
            'solutions': solutions}
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
    elif category == 'Weapons' or category == 'Skills' or category == 'Specials':
        check = any(remove_trailing_symbols(target) in value for value in values)
    else:
        check = target in values
    return check


# used to allow for heroes with any version of that skill or weapon
def remove_trailing_symbols(text):
    if text:
        return re.sub(r'[^a-zA-Z)]+$', '', text)
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

    return get_grid(categories, targets,
                    [top_left, top_mid, top_right, left, mid, right, bottom_left, bottom_mid, bottom_right])


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
        random.shuffle(CATEGORIES)
        categories = CATEGORIES[:6]
        # print(categories)
    targets = get_targets(categories)

    return get_potential_grid(categories, targets)


def is_answerable(grid, min_solutions):
    """ Brute force backtracking search. """
    start_time = time.time()

    # Shuffle the solutions so that we don't always get answers close to 'A'
    for i in range(9):
        random.shuffle(grid['solutions'][i])

    # lengths = [len(solution) for solution in grid['solutions']]
    if any(solution < min_solutions for solution in get_solutions_length(grid)):
        # print(f'Not enough solutions: {lengths}')
        return False

    already_used = [None for _ in range(9)]
    index_into_i = [0 for _ in range(9)]
    i = 0
    while i < 9:
        # print(already_used)
        if index_into_i[i] >= len(grid['solutions'][i]):
            # print(f'No solution: {[solution for solution in grid['solutions']]}')
            return False

        for j, solution in enumerate(grid['solutions'][i], start=index_into_i[i]):
            # This solution works for now.
            if solution not in already_used:
                already_used[i] = solution
                index_into_i[i] = j + 1
                i += 1
                break
        else:
            # No solution was found that works.
            already_used[i - 1] = None
            i -= 1

            if time.time() - start_time > 300:
                # This code SHOULD never infinitely loop... but we're probably in an infinite loop, just try again.
                print(f'Timed out with {[solution for solution in grid['solutions']]}')
                return False
    print(f'Solution found: {already_used}')
    return True


def make_game(min_solutions, forced_categories=None, show=False, i=None):
    if show:
        print(f'Started epoch {i}')
        start_time = time.perf_counter()

    try:
        read_heroes('./heroes_v2.json')
        seed_categories_and_options()

        while True:
            grid = get_potential_game(forced_categories)

            if is_answerable(grid, min_solutions):
                break

            # if show:
            #     print([len(solution) for solution in grid['solutions']])

        if show:
            print(f'Game generated in {time.perf_counter() - start_time} seconds.')

        return grid
    except OSError:
        pass


# if __name__ == "__main__":
#     g = make_game(1, ['Weapons'])
#     print(g['solutions'])
#     print([len(solution) for solution in g['solutions']])
