// const categoryCellIndexes = [0, 1, 2, 3, 4, 8, 12];
const searchInput = document.getElementById('searchInput');
const searchBar = document.getElementById('searchBar');
const guessesNumber = document.getElementById('guessesNumber');

const searchResults = document.getElementById('searchResults');
const gridContainer = document.getElementById('gridContainer');

const gameOverBox = document.getElementById('game-over-box');
const dimmer = document.getElementById('dimmer');

const categories = grid.categories;
const targets = grid.targets;

let selectedCell = null;
let selectedCellIndex = null;
// A list of resultElements for all heroes with images attached.
// TODO: refactor this into a set for better performance.
let resultElements = [];
// A 9-element array of sets where each maps to the selectedCellIndex for already chosen heroes.
let cellCorrectness = Array.from({length: 9})
    .map(() => ({"correct": new Set(), "incorrect": new Set()}));
let guessesLeft = 1;
let score = 0;

function toggleDimmerOn() {
    dimmer.style.opacity = '0.5';
    dimmer.style.pointerEvents = 'auto';
}

function toggleDimmerOff() {
    dimmer.style.opacity = '0';
    dimmer.style.pointerEvents = 'none';
}

function toggleSearchOn() {
    clearResults();
    searchInput.placeholder = grid['solutions'][selectedCellIndex].length + ' possible solutions...';
    searchBar.style.opacity = '1';
}

function toggleSearchOff() {
    searchBar.style.opacity = '0';
    toggleSearchResultsOff();
}

function toggleSearchResultsOn() {
    searchResults.style.transition = '';
    searchResults.style.opacity = '1';
    searchResults.style.pointerEvents = 'auto';
}

function toggleSearchResultsOff() {
    searchResults.style.transition = 'opacity 0.5s ease-in-out';
    searchResults.style.opacity = '0';
    searchResults.style.pointerEvents = 'none';
}

function toggleGameOverBoxOn() {
    gameOverBox.style.opacity = '1';
    gameOverBox.style.display = 'flex';
}

function toggleGameOverBoxOff() {
    gameOverBox.style.opacity = '0';
}

function clearResults() {
    searchInput.value = '';
    searchResults.innerHTML = '';
}

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
            evaluateCorrectness(hero, name, resultItem);
        }

        resultItem.addEventListener('click', handleResultClickEvent)

        resultElements.push(resultItem);
    })
}

function addDimEvent() {
    dimmer.addEventListener('click', function () {
        toggleDimmerOff();
        toggleSearchOff();
        toggleGameOverBoxOff();
    });
}

function addClickableCellEvent() {
    document.addEventListener('DOMContentLoaded', function () {
        let cells = document.querySelectorAll(".grid-item");
        cells.forEach((cell, i) => {
            cell.addEventListener("click", function () {
                console.log(grid['solutions'][i])
                selectCell(cell, i);
                toggleSearchOn();
                toggleDimmerOn();
            });
        })
    });
}

function addSearchEvent() {
    function displayResults(searchString) {
        // Reset the search.

        searchResults.innerHTML = '';
        resultElements.forEach((resultItem => {
            if (cellCorrectness[selectedCellIndex]['correct'].has(resultItem.innerHTML)) {
                resultItem.classList.toggle("correct");
            } else if (cellCorrectness[selectedCellIndex]['incorrect'].has(resultItem.innerHTML)) {
                resultItem.classList.toggle("incorrect");
            } else {
                resultItem.classList.remove("correct", "incorrect");
            }
            if (resultItem.innerHTML.toLowerCase().includes(searchString)) {
                searchResults.appendChild(resultItem);
            }
        }))

        toggleSearchResultsOn();
    }

    searchInput.addEventListener('input', input => {
        const searchString = searchInput.value.toLowerCase();
        displayResults(searchString);
    });
}

function selectCell(cell, i) {
    selectedCell = cell;
    selectedCellIndex = i;
}

function calcMaxScore() {
    let ret = 0;
    for (let i = 0; i < 9; i++) {
        ret += calcScore(i)
    }
    return ret;
}

function calcScore(i) {
    return 100*(1056 - grid['solutions'][i].length)/1055
}

function calcRarityColor(n) {
    if (n === 1) {
        return 'gold';
    } else if (2 <= n && n <= 10) {
        return '#ba81c5';
    } else if (11 <= n && n <= 30) {
        return '#b0c4ef';
    } else if (31 <= n && n <= 70) {
        return '#a0c35a';
    } else {
        return '#808080';
    }
}

function calcText(score) {
    if (score === 0) {
        return 'OH...';
    } else if (1 <= score && score <= 25) {
        return 'EH.';
    } else if (26 <= score && score <= 50) {
        return 'NICE!';
    } else if (51 <= score && score <= 75) {
        return 'GREAT!';
    } else {
        return '🐐';
    }
}

function makeGameOverGrid() {
    let id = null;

    // Color all the cells with their correct rarity color.
    cellCorrectness.forEach((_cell, i) => {
        if (_cell['correct'].size > 0) {
            // A bit nasty.
            id = 'gameOverGrid' + (i + 1).toString(); // forEach i starts at 1.
            let cell = document.getElementById(id);
            cell.style.backgroundColor = calcRarityColor(grid['solutions'][i].length);
        }
    })

    // Show the score over the max score.
    let scoreValue = document.getElementById('scoreValue');
    let scoreText = document.getElementById('scoreText');
    let scorePercentage = 100*score/calcMaxScore();
    // If the number ends with a zero...
    // TODO: Refactor
    if (scorePercentage % 1 === 0) {
        scorePercentage = scorePercentage.toFixed(0);
    } else {
        scorePercentage = scorePercentage.toFixed(2);
    }
    scoreValue.innerText = scorePercentage.toString();
    scoreText.innerText = calcText(Number(scorePercentage));
}

function endGame() {
    // console.log('Game ended. Score: ' + score + ' out of 900.');
    toggleDimmerOn();
    makeGameOverGrid();
    toggleGameOverBoxOn();
}

function decrementGuesses() {
    guessesLeft -= 1;
    guessesNumber.innerText = guessesLeft;
    if (guessesLeft === 0) {
        toggleSearchOff();
        toggleDimmerOn();
        endGame();
    }
}

function evaluateCorrectness(hero, result, resultItem) {
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

        toggleSearchOff();
        toggleDimmerOff();

        score += calcScore(selectedCellIndex);
        cellCorrectness[selectedCellIndex]['correct'].add(result)
        resultItem.classList.toggle("correct");
        selectedCell.style.pointerEvents = 'none';
        console.log('correct');
    } else {
        cellCorrectness[selectedCellIndex]['incorrect'].add(result)
        resultItem.classList.toggle("incorrect");
        console.log('incorrect');
    }
    console.log(cellCorrectness)
    decrementGuesses();
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

    if (i === 5) {
        gridItem.classList.add('top-left');
    } else if (i === 7) {
        gridItem.classList.add('top-right');
    } else if (i === 13) {
        gridItem.classList.add('bottom-left');
    } else if (i === 15) {
        gridItem.classList.add('bottom-right');
    }
}

// On run:
guessesNumber.innerText = guessesLeft;
makeResultItems();
addDimEvent();
addClickableCellEvent();
addSearchEvent();
