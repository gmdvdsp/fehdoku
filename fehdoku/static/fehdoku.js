// const categoryCellIndexes = [0, 1, 2, 3, 4, 8, 12];
const searchInput = document.getElementById('searchInput');
const searchBar = document.getElementById('searchBar');
const dimmer = document.getElementById('dimmer');
const guessesNumber = document.getElementById('guessesNumber');


const searchResults = document.getElementById('searchResults');
const gridContainer = document.getElementById('gridContainer');

const categories = grid.categories;
const targets = grid.targets;

let selectedCell = null;
let selectedCellIndex = null;
let resultElements = [];

function seedResults() {
    grid['options'].forEach(name => {
        const resultItem = document.createElement('li');
        resultItem.className = 'result-item';
        resultItem.innerHTML = name;
        let heroObject = null;

        grid['heroes'].forEach(hero => {
            // will always succeed, very nasty
            if (hero['name'] === name) {
                resultItem.style.backgroundImage = "url(" + hero['image'] + ")";
                resultItem.style.backgroundSize = "75px 75px";
                heroObject = hero;
            }
        })

        resultItem.addEventListener('click', function () {
            searchInput.value = name;
            nameAndTitle = name.split(':')
            // selectedCell.innerHTML = nameAndTitle[0] + ':\n' + nameAndTitle[1];
            evaluateCorrectness(heroObject, name);

            searchResults.style.display = 'none';
            searchInput.value = null;
            searchBar.style.opacity = '0';
            dimmer.style.opacity = '0';
        })

        resultElements.push(resultItem);
    })
}

function addDimEvent() {
    dimmer.addEventListener('click', function () {
        dimmer.style.opacity = '0';
    });
}

function addClickableCellEvent() {
    document.addEventListener('DOMContentLoaded', function () {
        let cells = document.querySelectorAll(".grid-item");
        cells.forEach((cell, i) => {
            cell.addEventListener("click", function () {
                toggleDropdown(i, cell);
            });
        })
    });
}

function addSearchEvent() {
    searchInput.addEventListener('input', function () {
        const inputValue = searchInput.value.toLowerCase();
        let options = []
        // if empty, cancel
        let heroes = [];
        if (inputValue.length === 0) {
            options = []
        } else {
            grid['heroes'].filter((heroObject) => {
                if (heroObject['name'].toLowerCase().includes(inputValue)) {
                    heroes.push(heroObject)
                }
            })
            heroes.forEach((hero) => {
                options.push(hero['name'])
            })
        }
        displayResults(heroes, options);
    });
}

function evaluateCorrectness(hero, result) {
    console.log(grid['solutions'][selectedCellIndex])
    if (grid['solutions'][selectedCellIndex].includes(result)) {
        selectedCell.style.backgroundColor = 'ghostwhite';

        // todo: refactor into the CSS file
        const gridLabel = document.createElement('div');
        gridLabel.classList.add('grid-label');
        gridLabel.innerText = hero['name'].split(':')[0];
        selectedCell.appendChild(gridLabel);

        const cellImage = document.createElement('img');
        cellImage.src = hero['image'];
        cellImage.style.position = "absolute";
        cellImage.style.height = "149px";
        cellImage.style.width = "149px";
        selectedCell.appendChild(cellImage);
        console.log('Correct')
    } else {
        // selectedCell.style.backgroundColor = 'ghostwhite';
        console.log('Incorrect')
    }
    guessesNumber.innerText -= 1;
}

function displayResults(heroes, results) {
    searchResults.innerHTML = '';

    if (!results) {
        searchResults.style.display = 'none';
        return;
    }

    results.forEach(result => {
        resultElements.forEach((resultItem => {
            if (resultItem.innerHTML === result) {
                searchResults.appendChild(resultItem);
            }
        }))
    });

    searchResults.style.display = 'block';
}

function toggleDropdown(i, cell) {
    selectedCell = cell;
    selectedCellIndex = i;
    if (searchBar.style.opacity === '0' || searchBar.style.opacity === '') {
        selectedCell = cell;
        searchBar.style.opacity = '1';
        dimmer.style.opacity = '0.5';
    } else {
        // click away from dropdown event is here for some reason
        selectedCell = null;
        searchBar.style.opacity = '0';
        dimmer.style.opacity = '0';
        searchInput.value = ''
        displayResults([])
        // console.log('test')
    }
}

// todo: REFACTOR HOLY
for (let i = 0; i < 16; i++) {
    const gridItem = document.createElement('div');
    gridItem.classList.add('grid-item');
    const categoryItem = document.createElement('div');
    categoryItem.classList.add('category-item');
    const categoryLabel = document.createElement('div');
    categoryLabel.classList.add('category-label');
    const categoryValue = document.createElement('div');
    categoryValue.classList.add('category-value');

    categoryItem.appendChild(categoryLabel);

    // extremely evil!
    if (i === 0) {
        gridContainer.appendChild(categoryItem);
    } else if (i === 1 || i === 2 || i === 3 || i === 4) {
        categoryLabel.textContent = categories[i - 1].toUpperCase();
        categoryValue.textContent = targets[i - 1].toUpperCase();
        categoryLabel.appendChild(categoryValue);
        gridContainer.appendChild(categoryItem);
    } else if (i === 8) {
        categoryLabel.textContent = categories[4].toUpperCase();
        categoryValue.textContent = targets[4].toUpperCase();
        categoryLabel.appendChild(categoryValue);
        gridContainer.appendChild(categoryItem);
    } else if (i === 12) {
        categoryLabel.textContent = categories[5].toUpperCase();
        categoryValue.textContent = targets[5].toUpperCase();
        categoryLabel.appendChild(categoryValue);
        gridContainer.appendChild(categoryItem);
    } else {
        categoryLabel.appendChild(categoryValue);
        gridContainer.appendChild(gridItem);
    }

    if (i === 0) {
        categoryItem.classList.add('top-left');
    } else if (i === 3) {
        categoryItem.classList.add('top-right');
    } else if (i === 12) {
        categoryItem.classList.add('bottom-left');
    } else if (i === 15) {
        gridItem.classList.add('bottom-right');
    }
}

seedResults();
addDimEvent();
addClickableCellEvent();
addSearchEvent();
