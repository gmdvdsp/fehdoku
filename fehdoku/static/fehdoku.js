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

function addDimEvent() {
    dimmer.addEventListener('click', function () {
        dimmer.style.opacity = '0';
        // displayResults([]);
    });
}

function addClickableCellEvent() {
    document.addEventListener('DOMContentLoaded', function () {
        let cells = document.querySelectorAll(".grid-item");
        cells.forEach((cell, i) => {
            cell.addEventListener("click", function () {
                showDropdown(i, cell);
            });
        })
    });
}

function addSearchEvent() {
    searchInput.addEventListener('input', function () {
        const inputValue = searchInput.value.toLowerCase();
        let options = []
        // if empty, cancel
        if (inputValue.length === 0) {
            options = []
        } else {
            options = grid['options'].filter(option =>
                option.toLowerCase().includes(inputValue));
        }
        displayResults(options);
    });
}

function evaluateCorrectness(result, i) {
    if (grid['solutions'][i].includes(result)) {
        selectedCell.style.color = 'green';
        console.log('Correct')
    } else {
        selectedCell.style.color = 'red';
        console.log('Incorrect')
    }
    guessesNumber.innerText -= 1;
}

function displayResults(results) {
    searchResults.innerHTML = '';

    if (results.length === 0) {
        searchResults.style.display = 'none';
        return;
    }

    results.forEach(result => {
        const resultItem = document.createElement('li');
        resultItem.className = 'result-item';
        resultItem.innerHTML = result;

        resultItem.addEventListener('click', function () {
            searchInput.value = result;
            // only take the name for now
            nameAndTitle = result.split(':')
            selectedCell.innerHTML = nameAndTitle[0] + ':\n' + nameAndTitle[1];
            evaluateCorrectness(result, selectedCellIndex);

            searchResults.style.display = 'none';
            searchInput.value = null;
            searchBar.style.opacity = '0';
            dimmer.style.opacity = '0';
        });

        searchResults.appendChild(resultItem);
    });

    searchResults.style.display = 'block';
}

function showDropdown(i, cell) {
    if (!selectedCell) {
        selectedCell = cell;
        selectedCellIndex = i;
    }
    if (searchBar.style.opacity === '0' || searchBar.style.opacity === '') {
        selectedCell = cell;
        searchBar.style.opacity = '1';
        dimmer.style.opacity = '0.5';
    } else {
        selectedCell = null;
        searchBar.style.opacity = '0';
        dimmer.style.opacity = '0';
    }
    console.log(i)
}

// todo: REFACTOR HOLY SH*T
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

addDimEvent();
addClickableCellEvent();
addSearchEvent();
