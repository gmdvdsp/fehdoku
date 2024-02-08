import json

from bs4 import BeautifulSoup
import requests
import os
import re

PREFIX = 'https://feheroes.fandom.com/'
FILE_PATH = 'heroes_v2.json'
MAX = 1055

heroes = []


def get_soup_from_page(link, debug=False):
    resp = requests.get(link)
    if debug:
        if resp.status_code not in [200, 201]:
            print(f'BAD: {link}')
        else:
            print(f'GOOD: {link}')
    html = resp.text
    soup = BeautifulSoup(html, 'html.parser')
    return soup


def strip_whitespace(text):
    return text.replace(u'\xa0', u' ').strip()


def download(name, link):
    path = f'./static/img/heroes/{name}.webp'
    if not os.path.exists(path):
        r = requests.get(link, allow_redirects=True)
        open(path, 'wb').write(r.content)


def write(contents, path=FILE_PATH, return_json=True):
    try:
        with open(path, 'w', encoding="utf-8") as file:
            if return_json:
                file.write(json.dumps(contents, ensure_ascii=False))
            else:
                file.write(contents)
            file.close()
    except Exception as e:
        print(f'Failed to write. REASON: {e}')
        raise


def handle_rarities(hero, tr):
    rarities = strip_whitespace(tr.find('td').text.strip())

    # turn all numbers in the string into a list of numbers
    numbers = re.findall(r'\d+', rarities)
    hero['Rarities'] = numbers
    hero['Special Rarity'] = None

    # search for all text after the first non-decimal or symbol
    special = re.search(r'(?<=\D)\s*[A-Za-z\s]+$', rarities)
    if special:
        # remove double spaces
        group = strip_whitespace(re.sub(r'\s{2,}', ' ', special.group()))
        hero['Special Rarity'] = group

        if group == 'SR':
            hero['Rarities'].append('5')


def handle_weapon_type(hero, tr):
    full_weapon_type = strip_whitespace(tr.find('a').get('title'))
    color_and_weapon = full_weapon_type.split(' ')
    implicit_color_weapons = {'Sword': 'Red', 'Axe': 'Green', 'Lance': 'Blue', 'Staff': 'Colorless'}

    if color_and_weapon[0] in implicit_color_weapons:
        hero['Weapon'] = color_and_weapon[0]
        hero['Color'] = implicit_color_weapons[color_and_weapon[0]]
    else:
        # for some reason, bow isn't capitalized
        hero['Weapon'] = color_and_weapon[1].capitalize()
        hero['Color'] = color_and_weapon[0]


def handle_entry(hero, tr):
    entries = []
    tags = tr.find_all('a')
    for a in tags:
        entries.append(a.text)
    hero['Entries'] = entries


def handle_version(hero, tr):
    versions = strip_whitespace(tr.find('a').text)
    hero['Version'] = versions


def parse_infobox(hero, soup):
    table_trs = soup.find('table', class_='wikitable hero-infobox').find_all('tr')
    for tr in table_trs:
        try:
            category = tr.find('th').text.strip()
            if category == 'Rarities':
                handle_rarities(hero, tr)
            elif category == 'Weapon Type':
                handle_weapon_type(hero, tr)
            elif category == 'Move Type':
                item = tr.find('a').get('title')
                hero[category] = item
            elif category in ['Entry', 'Entries']:
                handle_entry(hero, tr)
            elif category == 'Version':
                handle_version(hero, tr)
        except AttributeError:
            pass


def parse_stats(hero, soup):
    # the second table is the one that contains LVL 40 stats
    table = soup.find_all('table', class_='wikitable default')[1]
    # the last tr in the second table is the one that contains 5-star stats
    five_star_tr = table.find_all('tr')[-1]
    tds = five_star_tr.find_all('td')
    stats = ['HP', 'ATK', 'SPD', 'DEF', 'RES']

    # the first td contains irrelevant info
    for td, stat in zip(tds[1:], stats):
        hero[stat] = td.text.split('/')


def parse_weapons(hero, soup):
    weapons = None
    tables = soup.find_all('table', class_='wikitable default unsortable skills-table')
    for table in tables:
        if table.find_all('th', string='Might'):
            weapons = table
            break
    hero['Weapons'] = []

    if weapons is not None:
        for a in weapons.find_all('a'):
            hero['Weapons'].append(a.get('title'))


def parse_assists(hero, soup):
    assists = None
    tables = soup.find_all('table', class_='wikitable default unsortable skills-table')
    for table in tables:
        all_text = table.text
        if 'Cooldown' not in all_text and 'Might' not in all_text and 'Type' not in all_text:
            assists = table
            break
    hero['Assists'] = []

    if assists is not None:
        for a in assists.find_all('a'):
            hero['Assists'].append(a.get('title'))


def parse_specials(hero, soup):
    specials = None
    tables = soup.find_all('table', class_='wikitable default unsortable skills-table')
    for table in tables:
        if table.find_all('th', string='Cooldown'):
            specials = table
            break
    hero['Specials'] = []

    if specials is not None:
        for a in specials.find_all('a'):
            hero['Specials'].append(a.get('title'))


def parse_skills(hero, soup):
    table = soup.find('table', class_='wikitable default skills-table')
    hero['Skills'] = []

    if table is not None:
        for a in table.find_all('a', class_=None):
            hero['Skills'].append(a.text)


def parse_image(hero, soup):
    image_list = soup.find_all('a', href=True)
    for a in image_list:
        try:
            if a.get('title') == hero['name']:
                img = a.find('img')
                name_words = img.get('alt').replace(' ', '_')

                # custom case for Gustav, because his picture is named something different for some reason
                if hero['name'] == 'Gustav: Sovereign Slain':
                    download(name_words,
                             'https://static.wikia.nocookie.net/feheroes_gamepedia_en/images/5/5d/Gustav_Exsanguinator_Face_FC.webp/revision/latest')
                else:
                    try:
                        if name_words in img.get('data-src'):
                            path = img.get('data-src').split('/scale-to-width-down')[0]
                            download(name_words, path)
                            print(path)
                    except TypeError:
                        if name_words in img.get('src'):
                            path = img.get('src').split('/scale-to-width-down')[0]
                            download(name_words, img.get('src').split('/scale-to-width-down')[0])
                            print(path)
                hero['image'] = f'img/heroes/{name_words}.webp'
        except:
            pass


def parse_hero(hero, link):
    soup = get_soup_from_page(link)

    parse_infobox(hero, soup)
    parse_stats(hero, soup)
    parse_weapons(hero, soup)
    parse_assists(hero, soup)
    parse_specials(hero, soup)
    parse_skills(hero, soup)


def parse_hero_list(link, print_n=MAX):
    soup = get_soup_from_page(link)
    heroes_parsed = 0

    hero_list = soup.find_all('tr', class_='hero-filter-element')
    # print(image_list)
    for hero in hero_list:
        try:
            # add name here because it's easier than in the main hero page
            a = hero.find('a')
            name = a.get('title')
            hero = {'name': name}
            page = a.get('href')

            parse_image(hero, soup)

            parse_hero(hero, f'{PREFIX}{page}')
            heroes.append(hero)
            heroes_parsed += 1

            print(f'{heroes_parsed}: Hero: {hero}')

            if print_n > 0:
                print_n = print_n - 1
            if print_n <= 0:
                write(heroes, path=FILE_PATH)
                return
        except Exception as e:
            print(f'CRASHED: {link}, REASON: {e}, Attempting to write to file...')
            write(heroes, path=FILE_PATH)
            return


if __name__ == '__main__':
    try:
        os.remove(FILE_PATH)
    except OSError:
        print(f'FAILED TO DELETE: {FILE_PATH}, REASON: {OSError}')
        pass

    parse_hero_list(f'{PREFIX}/List_of_Heroes', print_n=MAX)
