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
let guessesLeft = 1;
let score = 0;

function makeResultItems() {
    grid['options'].forEach(name => {
        // Create a resultItem for every name.
        const resultItem = document.createElement('li');
        resultItem.className = 'result-item';
        resultItem.innerHTML = name;
        let hero = null;

        // Set the appropriate image.
        grid['heroes'].forEach(_hero => {
            if (_hero['name'] === name) {
                resultItem.style.backgroundImage = "url(" + _hero['image'] + ")";
                hero = _hero;
            }
        })

        function handleResultClickEvent() {
            searchInput.value = name;
            name = name.split(':')
            evaluateCorrectness(hero, name, resultItem);
        }
        resultItem.addEventListener('click', handleResultClickEvent)

        resultElements.push(resultItem);
    })
}

function toggleDimmerOff() {
    dimmer.style.opacity = '0';
    dimmer.style.pointerEvents = 'none';
}

function toggleSearchOn() {
    searchResults.style.display = 'block';
}
function toggleSearchOff() {
    searchResults.style.display = 'none';
    searchInput.value = null;
    searchBar.style.opacity = '0';
}

function addDimEvent() {
    dimmer.addEventListener('click', function () {
        // console.log('clicked')
        toggleDimmerOff();
        toggleSearchOff();
        displayResults([]);
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

function calcScore() {
    return 100*(1055 - grid['solutions'][selectedCellIndex].length)/1055
}

function endGame() {
    console.log('Game ended. Score:' + score + ' out of 900.')
}

function evaluateCorrectness(hero, result, resultItem) {
    console.log(grid['solutions'][selectedCellIndex])
    if (grid['solutions'][selectedCellIndex].includes(result)) {
        selectedCell.style.backgroundColor = 'ghostwhite';

        // todo: refactor
        const gridLabel = document.createElement('div');
        gridLabel.classList.add('grid-label');
        gridLabel.innerText = hero['name'].split(':')[0];
        selectedCell.appendChild(gridLabel);

        const cellImage = document.createElement('img');
        cellImage.src = hero['image'];
        cellImage.style.position = "absolute";
        cellImage.style.height = "150px";
        cellImage.style.width = "150px";
        selectedCell.appendChild(cellImage);

        // this hides the dropdown
        searchResults.style.display = 'none';
        searchInput.value = null;
        searchBar.style.opacity = '0';
        dimmer.style.opacity = '0';

        score += calcScore()
        resultItem.classList.toggle("correct");
    } else {
        resultItem.classList.toggle("incorrect");
    }
    guessesLeft -= 1;
    if (guessesLeft === 0) {
        endGame();
    }
}

function displayResults(heroes, results) {
    // Clear the results first.
    searchResults.innerHTML = '';

    results.forEach(result => {
        resultElements.forEach((resultItem => {
            if (resultItem.innerHTML === result) {
                searchResults.appendChild(resultItem);
            }
        }))
    });

    toggleSearchOn();
}

function toggleDropdown(i, cell) {
    selectedCell = cell;
    selectedCellIndex = i;
    searchInput.placeholder = grid['solutions'][selectedCellIndex].length + ' possible solutions...';
    if (searchBar.style.opacity === '0' || searchBar.style.opacity === '') {
        selectedCell = cell;
        searchBar.style.opacity = '1';
        dimmer.style.opacity = '0.5';
        dimmer.style.pointerEvents = 'auto';
    } else {
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

guessesNumber.innerText = guessesLeft
makeResultItems();
addDimEvent();
addClickableCellEvent();
addSearchEvent();
