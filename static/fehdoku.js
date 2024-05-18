// let grid = game[date]['grid'];
// let guesses = game[date]['guesses'];
// let guessesLeft = game[date]['guessesLeft'];
// let score = game[date]['score'];
// let heroes = constants['heroes'];

let grid = null;
let guesses = null;
let guessesLeft = null;
let score = null;
let heroes = constants['heroes'];

let selectedGrid = document.getElementById('currentGrid');

const searchInput = document.getElementById('searchInput');
const searchBar = document.getElementById('searchBar');
const searchResults = document.getElementById('searchResults');

const gridContainer = document.getElementById('gridContainer');
const guessesNumber = document.getElementById('guessesNumber');

const pastGamesBox = document.getElementById('pastGamesBox');
const gameOverBox = document.getElementById('game-over-box');

const dimmer = document.getElementById('dimmer');

let selectedCell = null;
let selectedCellIndex = null;
let selectedGridIndex = 1;

// A list of resultElements for all heroes with images attached.
// TODO: refactor this into a set for better performance.
let resultElements = [];

function makeRequest(verb, url, data) {
    let xhr = new XMLHttpRequest();
    xhr.open(verb, url, false);
    if (verb === 'GET') {
        xhr.send();
        return xhr.response;
    } else if (verb === 'POST') {
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(data);
        return xhr.response;
    }
}

function getClassElement(tag, className) {
    const element = document.createElement(tag);
    if (className !== null) {
        element.classList.add(className);
    }
    return element;
}

function toggleDimmerOn() {
    dimmer.style.opacity = '0.25';
    dimmer.style.pointerEvents = 'auto';
}

function toggleDimmerOff() {
    dimmer.style.opacity = '0';
    dimmer.style.pointerEvents = 'none';
}

function toggleSearchOn() {
    clearResults();
    searchInput.placeholder = grid['solutions'][selectedCellIndex].length + ' possible solutions...';
    searchBar.style.visibility = 'visible';
    searchBar.style.opacity = '1';
}

function toggleSearchOff() {
    searchBar.style.visibility = 'hidden';
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
    gameOverBox.style.pointerEvents = 'none';
    gameOverBox.style.opacity = '0';
}

function togglePastGamesBoxOn() {
    pastGamesBox.style.opacity = '1';
    pastGamesBox.style.pointerEvents = 'auto';
}

function togglePastGamesBoxOff() {
    pastGamesBox.style.pointerEvents = 'none';
    pastGamesBox.style.opacity = '0';
    pastGamesBox.style.pointerEvents = 'none';
}

function clearResults() {
    searchInput.value = '';
    searchResults.innerHTML = '';
}

function clearCells() {
    for (let i = 0; i < 9; i++) {
        let cellElement = document.getElementById('grid' + (i + 1).toString());
        let children = cellElement.children;
        let j = children.length - 1;
        while (j >= 0) {
            let child = children[j];
            if (child.classList.contains('grid-image') || child.classList.contains('grid-label') || child.classList.contains('grid-hero-block')) {
                cellElement.removeChild(child);
                cellElement.style.pointerEvents = 'auto';
            }
            j--;
        }
    }
}

function loadNewGame(newDate, newGame) {
    game = newGame;
    date = newDate;
    grid = newGame[newDate]['grid'];
    guesses = newGame[newDate]['guesses'];
    guessesLeft = newGame[newDate]['guessesLeft'];
    score = newGame[newDate]['score'];

    resultElements = [];
    clearCells();
}

function initialize(newDate, newGame) {
    toggleDimmerOff();
    togglePastGamesBoxOff();

    loadNewGame(newDate, newGame);
    guessesNumber.innerText = guessesLeft;
    makeResultItems();
    makeCategories();
    guesses.forEach(function (cell, i) {
        let correct = cell['correct'];
        let cellElement = document.getElementById('grid' + (i + 1).toString());

        if (correct !== null) {
            let image = heroes[correct];
            selectCell(cellElement, i);
            selectedCellIndex = i;
            handleCorrectGuess(correct, image);
        }
    })
    if (guessesLeft === 0) {
        endGame();
    }
}

function makeResultItems() {
    Object.entries(heroes).forEach(([name, image]) => {
        // Create a resultItem for every name.
        const resultItem = document.createElement('li');
        resultItem.className = 'result-item';
        resultItem.innerHTML = name;

        // Set the appropriate image.
        resultItem.style.backgroundImage = "url(" + image + ")";

        function handleResultClickEvent() {
            searchInput.value = name;
            evaluateCorrectness(name, image, resultItem);
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
        togglePastGamesBoxOff();
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
    function search(searchString) {
        // Reset the search.
        searchResults.innerHTML = '';

        resultElements.forEach((resultItem => {
            if (guesses[selectedCellIndex]['correct'] === resultItem.innerHTML) {
                resultItem.classList.add("correct");
            } else if (guesses[selectedCellIndex]['incorrect'].includes(resultItem.innerHTML)) {
                resultItem.classList.add("incorrect");
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
        search(searchString);
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
    return 100 * (1056 - grid['solutions'][i].length) / 1055
}

function calcRarityColor(n) {
    if (n === 1) {
        return '#ffd700';
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
        return 'DOPE.';
    } else if (71 <= score && score <= 99) {
        return 'GREAT!';
    } else {
        return '🐐';
    }
}

function makeGameOverGrid() {
    let id = null;
    let gameOverLabel = document.getElementById('game-over-value');
    gameOverLabel.innerText = 'FEHDOKU ' + grid['id'];

    // Color all the cells with their correct rarity color.
    guesses.forEach((cell, i) => {
        if (cell['correct'] !== null) {
            // A bit nasty.
            id = 'gameOverGrid' + (i + 1).toString(); // forEach i starts at 1.
            let cell = document.getElementById(id);
            cell.style.backgroundColor = calcRarityColor(grid['solutions'][i].length);
        }
    })

    // Show the score over the max score.
    let scoreValue = document.getElementById('scoreValue');
    let scoreText = document.getElementById('scoreText');
    let scorePercentage = 100 * score / calcMaxScore();
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
    console.log('here')
    toggleSearchOff();
    toggleDimmerOn();
    makeGameOverGrid();
    toggleGameOverBoxOn();
    gridContainer.style.pointerEvents = 'none';
}

function decrementGuesses() {
    guessesLeft -= 1;
    guessesNumber.innerText = guessesLeft;
    if (guessesLeft === 0) {
        toggleSearchOff();
        endGame();
    }
}

function addCornerRounding(htmlElement, corners) {
    const cornerClasses = {
        0: 'top-left',
        2: 'top-right',
        6: 'bottom-left',
        8: 'bottom-right',
    };

    const borderRounding = cornerClasses[selectedCellIndex];
    if (corners.includes(borderRounding)) {
        htmlElement.classList.add(borderRounding);
    }
}

function handleCorrectGuess(name, image) {
    let gridLabel = getClassElement('div', 'grid-label');
    let blackBox = getClassElement('div', 'grid-hero-block');
    let cellImage = getClassElement('img', 'grid-image');

    gridLabel.innerText = name.split(':')[0];
    cellImage.src = image;

    addCornerRounding(blackBox, ['bottom-left', 'bottom-right']);
    addCornerRounding(cellImage, ['top-left', 'top-right', 'bottom-left', 'bottom-right']);

    selectedCell.appendChild(gridLabel);
    selectedCell.appendChild(blackBox)
    selectedCell.appendChild(cellImage);
    selectedCell.style.pointerEvents = 'none';

    guesses[selectedCellIndex]['correct'] = name
}

function handleIncorrectGuess(name, resultItem) {
    guesses[selectedCellIndex]['incorrect'].push(name);
    resultItem.classList.add("incorrect");
}

function evaluateCorrectness(name, image, resultItem) {
    if (grid['solutions'][selectedCellIndex].includes(name)) {
        handleCorrectGuess(name, image)
        toggleSearchOff();
        toggleDimmerOff();
        score += calcScore(selectedCellIndex);
    } else {
        // If the user guesses wrong, we also need the result item to change its color.
        handleIncorrectGuess(name, resultItem);
    }
    decrementGuesses();

    // First, set all the unreferenced variables:
    console.log(game, date)
    game[date]['guessesLeft'] = guessesLeft;
    game[date]['score'] = score;

    makeRequest('POST', '/update-game/' + date, JSON.stringify(game));
}

function makeCategories() {
    [1, 2, 3, 4, 5, 6].forEach(i => {
        let labelID = 'categoryLabel' + i.toString();
        let valueID = 'categoryValue' + i.toString();
        let categoryLabel = document.getElementById(labelID);
        let categoryValue = document.getElementById(valueID);
        categoryLabel.childNodes[0].textContent = grid['categories'][i - 1].toUpperCase();
        categoryValue.textContent = grid['targets'][i - 1].toUpperCase();
    })
}

function handleDailySelection() {
    if (guessesLeft === 0) {
        toggleDimmerOn();
        toggleGameOverBoxOn();
    }
}

function makePastGamesBox() {
    makeRequest('POST', '/update-game/' + date, JSON.stringify(game))
    for (let i = 1; i < 8; i++) {
        let response = JSON.parse(makeRequest('GET', '/past-grids/' + initial_date + '/' + (i - 1), null));
        let pastGridItem = document.getElementById('pastGames' + i);
        let newDate = response['key']
        let newGame = response['data']
        pastGridItem.innerText = '# ' + i + ' • ' + newDate;

        function handleGridSelectionEvent() {
            if (i !== selectedGridIndex) {
                selectedGridIndex = i;
                initialize(newDate, newGame);
            }
        }

        pastGridItem.addEventListener('click', handleGridSelectionEvent)
    }
}

function handlePastGridSelection() {
    toggleDimmerOn();
    togglePastGamesBoxOn();
}

function addGridSelection() {
    const dailyGrid = document.getElementById('currentGrid');
    const pastGrids = document.getElementById('pastGrids');
    selectGrid(dailyGrid);

    function addGridSelectionEvent(grid, otherGrid, handleFunction) {
        grid.addEventListener('click', () => {
            if (selectedGrid !== grid) {
                deselectGrid(otherGrid);
                selectGrid(grid);
            }
            handleFunction();
        });
    }

    addGridSelectionEvent(dailyGrid, pastGrids, handleDailySelection);
    addGridSelectionEvent(pastGrids, dailyGrid, handlePastGridSelection);
}

function deselectGrid(grid) {
    const selectedEffect = document.getElementById('selectedGrid');
    grid.removeChild(selectedEffect);
}

function selectGrid(grid) {
    selectedGrid = grid;
    let selectedEffect = document.createElement('div');
    selectedEffect.setAttribute("id", "selectedGrid");
    grid.appendChild(selectedEffect);
}

initialize(date, game);
addGridSelection();
makePastGamesBox();
addDimEvent();
addClickableCellEvent();
addSearchEvent();
