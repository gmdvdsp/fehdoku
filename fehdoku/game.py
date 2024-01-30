import grid as g


def display_initial_grid(grid, already_guessed_indexes):
    for i, cell in enumerate(grid['game']):
        if i not in already_guessed_indexes:
            print(f'index: {i}, categories: {cell['categories']}', sep='\n')


def get_hero_data(name, key, data):
    try:
        for hero in data:
            if hero['name'] == name:
                return hero[key]
    except Exception as e:
        print('Found nothing!')


def show_feedback(chosen_cell, chosen_hero, grid, show_solutions=False):
    # assumes that the names of categories are top-level keys in hero_data
    categories = grid['game'][chosen_cell]['categories']
    category_1, category_2 = list(categories)[0], list(categories)[1]
    print(f'Target was {categories} and unit has '
          f'{category_1}: {get_hero_data(chosen_hero, category_1, grid['heroes'])}, '
          f'{category_2}: {get_hero_data(chosen_hero, category_2, grid['heroes'])}')
    if show_solutions:
        print(f'Solutions: {sorted(grid['game'][chosen_cell]['solutions'])}')


def process_turn(chosen_cell, chosen_hero, grid, feedback=False):
    try:
        ret = int(chosen_hero in grid['game'][chosen_cell]['solutions'])
        if ret and feedback:
            print('Correct.')
            show_feedback(chosen_cell, chosen_hero, grid)
        else:
            print('Incorrect.')
            show_feedback(chosen_cell, chosen_hero, grid, show_solutions=True)
        return ret
    except Exception as e:
        print(f'CRASH: {e}')


def play(grid, feedback=False):
    correct_count = 0
    already_guessed_indexes = []
    tries = 9
    chosen_cell = None

    while tries > 0:
        display_initial_grid(grid, already_guessed_indexes)

        while chosen_cell is None or chosen_cell in already_guessed_indexes:
            chosen_cell = int(input("cell (0-9): "))
        already_guessed_indexes.append(chosen_cell)

        chosen_hero = input("hero name: ")

        if feedback:
            i = 0
            matches = {}
            for hero in grid['options']:
                if chosen_hero in hero:
                    matches[i] = hero
                    i += 1
            print(matches)
            chosen_index = int(input("which one (choose a number)?: "))
            chosen_hero = matches[chosen_index]

        score = process_turn(chosen_cell, chosen_hero, grid, feedback)

        if score:
            correct_count += 1

        tries -= 1
    print(f'Game over. You got {correct_count} right.')


def start():
    grid = g.make_game(show=False)
    # play(grid, feedback=True)
    return grid

if __name__ == '__main__':
    grid = g.make_game(show=False)
    play(grid, feedback=True)
