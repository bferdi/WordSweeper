document.addEventListener('DOMContentLoaded', () => {
    const gridSize = 10;
    const maxReveals = 5;
    let revealsLeft = maxReveals;
    let wordData = {};
    let grid = [];

    // Load word data from JSON file
    function loadWordData() {
        fetch('wordData.json')
            .then(response => response.json())
            .then(data => {
                const dayOfYear = getDayOfYear();
                wordData = data.words[dayOfYear.toString()]; // Get word data for the day
                if (wordData && wordData.positions) {
                    initializeGrid(); // Initialize grid after data is loaded
                } else {
                    console.error('Data format incorrect or missing positions');
                }
            })
            .catch(error => {
                console.error('Error loading word data:', error);
            });
    }

    // Get day of the year
    function getDayOfYear() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const day = Math.floor(diff / oneDay);
        return day;
    }

    // Initialize the game grid
    function initializeGrid() {
        const gridContainer = document.getElementById('grid');
        gridContainer.innerHTML = '';
        grid = [];

        for (let i = 0; i < gridSize; i++) {
            let row = [];
            for (let j = 0; j < gridSize; j++) {
                let cell = document.createElement('div');
                cell.classList.add('grid-item');
                cell.addEventListener('click', () => handleCellClick(i, j));
                gridContainer.appendChild(cell);

                let letter = getLetterForPosition(i, j);
                row.push({ x: i, y: j, letter: letter, revealed: false });
            }
            grid.push(row);
        }

        calculateDistances();
    }

    // Handle cell click
    function handleCellClick(x, y) {
        if (revealsLeft <= 0) {
            alert("No more reveals left!");
            return;
        }

        revealCell(x, y);
        revealsLeft--;
        updateRevealsDisplay();
    }

    // Reveal cell and adjacent cells
    function revealCell(x, y) {
        if (!isWithinGrid(x, y)) return; // Check if the cell is within the grid

        // Reveal the clicked cell and adjacent cells
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                let newX = x + dx;
                let newY = y + dy;

                if (isWithinGrid(newX, newY)) {
                    revealSingleCell(newX, newY);
                }
            }
        }
    }

    // Check if the given coordinates are within the grid
    function isWithinGrid(x, y) {
        return x >= 0 && x < gridSize && y >= 0 && y < gridSize;
    }

    // Reveal a single cell
    function revealSingleCell(x, y) {
        const cell = grid[x][y];
        if (!cell.revealed) {
            cell.revealed = true;
            updateCellDisplay(x, y);
        }
    }

    // Update the display of a cell after it's revealed
    function updateCellDisplay(x, y) {
        const cellElement = document.getElementsByClassName('grid-item')[x * gridSize + y];
        const cellData = grid[x][y];
        cellElement.textContent = cellData.letter || cellData.distance;
        cellElement.style.backgroundColor = '#ddd';
    }

// Update remaining reveals display
function updateRevealsDisplay() {
    const revealsDisplay = document.getElementById('reveals-display');
    if (revealsDisplay) {
        revealsDisplay.textContent = `Reveals left: ${revealsLeft}`;
    } else {
        console.error('Reveals display element not found');
    }
}


    // Get letter for a specific position
    function getLetterForPosition(x, y) {
        for (const [letter, pos] of Object.entries(wordData.positions)) {
            if (pos.x === x && pos.y === y) {
                return letter;
            }
        }
        return '';
    }

    // Calculate distances for each cell
    function calculateDistances() {
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (!grid[i][j].letter) {
                    grid[i][j].distance = calculateDistance(i, j);
                }
            }
        }
    }

    // Calculate distance from the nearest letter
    function calculateDistance(x, y) {
        let minDistance = gridSize * 2; // Max possible distance
        for (const pos of Object.values(wordData.positions)) {
            let dist = Math.abs(x - pos.x) + Math.abs(y - pos.y);
            if (dist < minDistance) {
                minDistance = dist;
            }
        }
        return minDistance;
    }

    // Guess word logic
    document.getElementById('guess-button').addEventListener('click', () => {
        const guessedWord = document.getElementById('guess-input').value;
        if (guessedWord.toLowerCase() === wordData.word.toLowerCase()) {
            alert("Correct! You guessed the word!");
        } else {
            alert("Incorrect guess. Try again tomorrow!");
        }
    });

    loadWordData(); // Load word data and initialize the game
});
