let grid = game[date]['grid'];
let guesses = game[date]['guesses'];
let guessesLeft = game[date]['guessesLeft'];
let score = game[date]['score'];

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

// A list of resultElements for all heroes with images attached.
// TODO: refactor this into a set for better performance.
let resultElements = [];

function makeRequest(verb, url, data) {
    let xhr = new XMLHttpRequest();
    xhr.open(verb, url, false);
    if (verb === 'GET') {
        xhr.send();
        console.log(xhr.response);
        return xhr.response;
    } else if (verb === 'POST') {
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(data);
        console.log(xhr.response);
        return xhr.response;
    }
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

function loadGame() {
    guesses.forEach(function (cell, i) {
        // If a correct guess was made for this cell
        let correct = cell['correct']; let incorrect = cell['incorrect'];
        if (correct !== null) {
            let image = grid['heroes'][correct]
            selectCell(document.getElementById('grid' + (i + 1).toString()), i);
            selectedCellIndex = i;
            evaluateCorrectness(correct, image, null)
        }

        incorrect.forEach(incorrectGuess => {
            // selectCell(document.getElementById('grid' + (i + 1).toString()), i);
            selectedCellIndex = i;
            // REALLY SHIT!
            console.log(guesses)
            decrementGuesses();
        })
        guessesNumber.innerText = guessesLeft;
    })
}

function makeResultItems() {
    Object.entries(grid['heroes']).forEach(([name, image]) => {
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
    const debounceSearch = _.debounce(searchString => {
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
    }, 200)

    searchInput.addEventListener('input', input => {
        const searchString = searchInput.value.toLowerCase();
        debounceSearch(searchString);
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
        return 'DOPE.';
    } else if (71 <= score && score <= 99) {
        return 'GREAT!';
    } else {
        return 'YOU THE 🐐.';
    }
}

function makeGameOverGrid() {
    let id = null;

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
        toggleDimmerOn();
        endGame();
    }
}

function evaluateCorrectness(name, image, resultItem) {
    if (grid['solutions'][selectedCellIndex].includes(name)) {
        // TODO: refactor
        const gridLabel = document.createElement('div');
        gridLabel.classList.add('grid-label');
        gridLabel.innerText = name.split(':')[0];
        gridLabel.style.zIndex = "300";
        selectedCell.appendChild(gridLabel);

        const blackBox = document.createElement('div');
        blackBox.classList.add('grid-hero-block');
        const cellImage = document.createElement('img');
        cellImage.src = image;
        cellImage.style.position = "absolute";
        cellImage.style.height = "150px";
        cellImage.style.width = "150px";
        // top left
        if (selectedCellIndex === 0) {
            cellImage.classList.add('top-left');
        } else if (selectedCellIndex === 2) {
            cellImage.classList.add('top-right');
        } else if (selectedCellIndex === 6) {
            cellImage.classList.add('bottom-left');
            blackBox.classList.add('bottom-left');
        } else if (selectedCellIndex === 8) {
            cellImage.classList.add('bottom-right');
            blackBox.classList.add('bottom-right');
        }
        selectedCell.appendChild(blackBox)
        selectedCell.appendChild(cellImage);

        toggleSearchOff();
        toggleDimmerOff();

        // TODO: make a request
        guesses[selectedCellIndex]['correct'] = name
        score += calcScore(selectedCellIndex);
        // console.log('correct');
    } else {
        // TODO: make a request
        guesses[selectedCellIndex]['incorrect'].push(name)
        resultItem.classList.toggle("incorrect");
        // console.log('incorrect');
    }
    decrementGuesses();
    makeRequest('POST', '/update-game/' + date, JSON.stringify(game))
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

function handleDailySelection(data) {
    if (guessesLeft === 0) {
        toggleDimmerOn();
        toggleGameOverBoxOn();
    }
}

function handlePastGridSelection(data) {
    toggleDimmerOn();
    togglePastGamesBoxOn();
    // toggleGameOverBoxOn();
}

function addGridSelection() {
    const dailyGrid = document.getElementById('currentGrid');
    const pastGrids = document.getElementById('pastGrids');
    selectGrid(dailyGrid);

    function addGridSelectionEvent(grid, otherGrid, url, handleFunction) {
        grid.addEventListener('click', () => {
            if (selectedGrid !== grid) {
                deselectGrid(otherGrid);
                selectGrid(grid);
                let data = makeRequest('GET', url);
                handleFunction(data)
            }
        });
    }

    addGridSelectionEvent(dailyGrid, pastGrids, "/daily", handleDailySelection);
    addGridSelectionEvent(pastGrids, dailyGrid, "/past-grids", handlePastGridSelection);
}

function deselectGrid(grid) {
    const selectedEffect = document.getElementById('selectedGrid');
    grid.removeChild(selectedEffect);
}

function selectGrid(grid) {
    // const currentGrid = document.getElementById('currentGrid');
    selectedGrid = grid;
    let selectedEffect = document.createElement('div');
    selectedEffect.setAttribute("id", "selectedGrid");
    grid.appendChild(selectedEffect);
}

loadGame();
addGridSelection();
makeResultItems();
makeCategories();
addDimEvent();
addClickableCellEvent();
addSearchEvent();
