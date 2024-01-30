// const categoryCellIndexes = [0, 1, 2, 3, 4, 8, 12];
const searchInput = document.getElementById('searchInput');
const searchBar = document.getElementById('searchBar');
const searchResults = document.getElementById('searchResults');
const gridContainer = document.getElementById('gridContainer');

let selectedCell = null;
let selectedCellIndex = null;

// allow cells to be clicked
document.addEventListener('DOMContentLoaded', function () {
    let cells = document.querySelectorAll(".grid-item");
    cells.forEach((cell, i) => {
        cell.addEventListener("click", function () {
            call_dropdown(i, cell);
        });
    })
});

// seed the search options
searchInput.addEventListener('input', function () {
    const inputValue = searchInput.value.toLowerCase();
    const options = grid['options'].filter(option =>
        option.toLowerCase().includes(inputValue)
    );

    displayResults(options);
});

// when the user makes a selection in the results, check if it's right
function evaluateCorrectness(result, i) {
    if (grid['solutions'][i].includes(result)) {
        selectedCell.style.color = 'green';
        console.log('Correct')
    } else {
        selectedCell.style.color = 'red';
        console.log('Incorrect')
    }
}

function displayResults(results) {
    searchResults.innerHTML = '';

    if (results.length === 0) {
        searchResults.style.display = 'none';
        return;
    }

    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.textContent = result;

        resultItem.addEventListener('click', function () {
            searchInput.value = result;
            // only take the name for now
            selectedCell.innerHTML = result.split(':')[0];
            evaluateCorrectness(result, selectedCellIndex);
            searchResults.style.display = 'none';
        });

        searchResults.appendChild(resultItem);
    });

    searchResults.style.display = 'block';
}

function call_dropdown(i, cell) {
    if (!selectedCell) {
        selectedCell = cell;
        selectedCellIndex = i;
    }
    if (searchBar.style.opacity === '0' || searchBar.style.opacity === '') {
        selectedCell = cell;
        searchBar.style.opacity = '1';
    } else {
        selectedCell = null;
        searchBar.style.opacity = '0';
    }
    console.log(i)
}

const categories = grid.categories;
const targets = grid.targets;

for (let i = 0; i < 16; i++) {
    const gridItem = document.createElement('div');
    const categoryItem = document.createElement('div');

    // extremely evil!
    if (i === 0) {
        categoryItem.classList.add('category-item');
        gridContainer.appendChild(categoryItem);
    } else if (i === 1 || i === 2 || i === 3 || i === 4) {
        categoryItem.classList.add('category-item');
        categoryItem.textContent = categories[i - 1].toUpperCase() + ':\n' + targets[i - 1];
        gridContainer.appendChild(categoryItem);
    } else if (i === 8) {
        categoryItem.classList.add('category-item');
        categoryItem.textContent = categories[4].toUpperCase() + ':\n' + targets[4];
        gridContainer.appendChild(categoryItem);
    } else if (i === 12) {
        categoryItem.classList.add('category-item');
        categoryItem.textContent = categories[5].toUpperCase() + ':\n' + targets[5];
        gridContainer.appendChild(categoryItem);
    } else {
        gridItem.classList.add('grid-item');
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
