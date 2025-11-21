document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const scoreDisplay = document.getElementById('score');
    const bestScoreDisplay = document.getElementById('best-score');
    const newGameBtn = document.getElementById('new-game');
    const tryAgainBtn = document.getElementById('try-again');
    const keepGoingBtn = document.getElementById('keep-going');
    const newGameWinBtn = document.getElementById('new-game-win');
    const gameOverScreen = document.querySelector('.game-over');
    const winScreen = document.querySelector('.win');

    let board = [];
    let score = 0;
    let bestScore = localStorage.getItem('bestScore') || 0;
    let gameWon = false;
    let gameOver = false;

    // Initialize the game
    function initGame() {
        // Create empty board
        board = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];

        // Clear the grid
        grid.innerHTML = '';
        
        // Create cells
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = i;
                cell.dataset.col = j;
                grid.appendChild(cell);
            }
        }

        // Reset game state
        score = 0;
        gameWon = false;
        gameOver = false;
        updateScore(0);
        
        // Hide game over and win screens
        gameOverScreen.style.display = 'none';
        winScreen.style.display = 'none';

        // Add initial tiles
        addRandomTile();
        addRandomTile();
        
        // Update the display
        updateBoard();
    }

    // Add a random tile (2 or 4) to an empty cell
    function addRandomTile() {
        const emptyCells = [];
        
        // Find all empty cells
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (board[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        
        // If there are empty cells, add a new tile
        if (emptyCells.length > 0) {
            const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            board[row][col] = Math.random() < 0.9 ? 2 : 4;
            
            // Add the 'new' class for the appear animation
            const tile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
            if (tile) {
                tile.classList.add('new');
                // Remove the class after animation completes
                setTimeout(() => {
                    tile.classList.remove('new');
                }, 200);
            }
            
            return true;
        }
        return false;
    }

    // Update the visual representation of the board
    function updateBoard() {
        // Remove all tiles
        document.querySelectorAll('.tile').forEach(tile => tile.remove());
        
        // Add tiles for non-zero cells
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const value = board[i][j];
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${value}`;
                    tile.textContent = value;
                    tile.dataset.row = i;
                    tile.dataset.col = j;
                    
                    // Position the tile
                    const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                    const rect = cell.getBoundingClientRect();
                    const gridRect = grid.getBoundingClientRect();
                    
                    tile.style.left = `${rect.left - gridRect.left}px`;
                    tile.style.top = `${rect.top - gridRect.top}px`;
                    
                    grid.appendChild(tile);
                }
            }
        }
    }

    // Move tiles in a specific direction
    function moveTiles(direction) {
        if (gameOver || (gameWon && !document.querySelector('.win').style.display === 'flex')) {
            return false;
        }

        let moved = false;
        const newBoard = JSON.parse(JSON.stringify(board));
        
        // Remove previous merged flags
        document.querySelectorAll('.tile').forEach(tile => {
            tile.classList.remove('merged');
        });

        if (direction === 'up' || direction === 'down') {
            for (let j = 0; j < 4; j++) {
                const column = [];
                for (let i = 0; i < 4; i++) {
                    if (board[i][j] !== 0) {
                        column.push(board[i][j]);
                    }
                }
                
                if (direction === 'up') {
                    // Merge tiles up
                    for (let i = 0; i < column.length - 1; i++) {
                        if (column[i] === column[i + 1]) {
                            column[i] *= 2;
                            score += column[i];
                            if (column[i] === 2048 && !gameWon) {
                                gameWon = true;
                                showWinScreen();
                            }
                            column.splice(i + 1, 1);
                            // Mark these tiles as merged for animation
                            markMergedTiles('col', j, i, i + 1, direction);
                        }
                    }
                    
                    // Fill with zeros
                    while (column.length < 4) {
                        column.push(0);
                    }
                    
                    // Update the board
                    for (let i = 0; i < 4; i++) {
                        if (board[i][j] !== column[i]) {
                            moved = true;
                        }
                        newBoard[i][j] = column[i];
                    }
                } else {
                    // Merge tiles down
                    column.reverse();
                    for (let i = 0; i < column.length - 1; i++) {
                        if (column[i] === column[i + 1]) {
                            column[i] *= 2;
                            score += column[i];
                            if (column[i] === 2048 && !gameWon) {
                                gameWon = true;
                                showWinScreen();
                            }
                            column.splice(i + 1, 1);
                            // Mark these tiles as merged for animation
                            markMergedTiles('col', j, 3 - i, 3 - (i + 1), direction);
                        }
                    }
                    
                    // Fill with zeros
                    while (column.length < 4) {
                        column.push(0);
                    }
                    column.reverse();
                    
                    // Update the board
                    for (let i = 0; i < 4; i++) {
                        if (board[i][j] !== column[i]) {
                            moved = true;
                        }
                        newBoard[i][j] = column[i];
                    }
                }
            }
        } else if (direction === 'left' || direction === 'right') {
            for (let i = 0; i < 4; i++) {
                const row = [];
                for (let j = 0; j < 4; j++) {
                    if (board[i][j] !== 0) {
                        row.push(board[i][j]);
                    }
                }
                
                if (direction === 'left') {
                    // Merge tiles left
                    for (let j = 0; j < row.length - 1; j++) {
                        if (row[j] === row[j + 1]) {
                            row[j] *= 2;
                            score += row[j];
                            if (row[j] === 2048 && !gameWon) {
                                gameWon = true;
                                showWinScreen();
                            }
                            row.splice(j + 1, 1);
                            // Mark these tiles as merged for animation
                            markMergedTiles('row', i, j, j + 1, direction);
                        }
                    }
                    
                    // Fill with zeros
                    while (row.length < 4) {
                        row.push(0);
                    }
                    
                    // Update the board
                    for (let j = 0; j < 4; j++) {
                        if (board[i][j] !== row[j]) {
                            moved = true;
                        }
                        newBoard[i][j] = row[j];
                    }
                } else {
                    // Merge tiles right
                    row.reverse();
                    for (let j = 0; j < row.length - 1; j++) {
                        if (row[j] === row[j + 1]) {
                            row[j] *= 2;
                            score += row[j];
                            if (row[j] === 2048 && !gameWon) {
                                gameWon = true;
                                showWinScreen();
                            }
                            row.splice(j + 1, 1);
                            // Mark these tiles as merged for animation
                            markMergedTiles('row', i, 3 - j, 3 - (j + 1), direction);
                        }
                    }
                    
                    // Fill with zeros
                    while (row.length < 4) {
                        row.push(0);
                    }
                    row.reverse();
                    
                    // Update the board
                    for (let j = 0; j < 4; j++) {
                        if (board[i][j] !== row[j]) {
                            moved = true;
                        }
                        newBoard[i][j] = row[j];
                    }
                }
            }
        }
        
        // Update the board if it changed
        if (moved) {
            board = newBoard;
            updateScore(score);
            
            // Add a new tile and update the display
            setTimeout(() => {
                addRandomTile();
                updateBoard();
                
                // Check if game over
                if (isGameOver()) {
                    showGameOver();
                }
            }, 150); // Wait for animation to complete
        }
        
        return moved;
    }
    
    // Mark tiles as merged for animation
    function markMergedTiles(type, index, pos1, pos2, direction) {
        let tile1, tile2;
        
        if (type === 'row') {
            tile1 = document.querySelector(`.tile[data-row="${index}"][data-col="${pos1}"]`);
            tile2 = document.querySelector(`.tile[data-row="${index}"][data-col="${pos2}"]`);
        } else {
            tile1 = document.querySelector(`.tile[data-row="${pos1}"][data-col="${index}"]`);
            tile2 = document.querySelector(`.tile[data-row="${pos2}"][data-col="${index}"]`);
        }
        
        if (tile1) tile1.classList.add('merged');
        if (tile2) tile2.classList.add('merged');
    }

    // Check if the game is over (no more moves possible)
    function isGameOver() {
        // Check for any empty cells
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (board[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // Check for possible merges
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const current = board[i][j];
                // Check right
                if (j < 3 && board[i][j + 1] === current) {
                    return false;
                }
                // Check down
                if (i < 3 && board[i + 1][j] === current) {
                    return false;
                }
            }
        }
        
        return true;
    }

    // Update the score display
    function updateScore(newScore) {
        score = newScore;
        scoreDisplay.textContent = score;
        
        // Update best score if current score is higher
        if (score > bestScore) {
            bestScore = score;
            bestScoreDisplay.textContent = bestScore;
            localStorage.setItem('bestScore', bestScore);
        }
    }

    // Show game over screen
    function showGameOver() {
        gameOver = true;
        gameOverScreen.style.display = 'flex';
    }

    // Show win screen
    function showWinScreen() {
        winScreen.style.display = 'flex';
    }

    // Event listeners
    document.addEventListener('keydown', (e) => {
        if (gameOver) return;
        
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                moveTiles('up');
                break;
            case 'ArrowDown':
                e.preventDefault();
                moveTiles('down');
                break;
            case 'ArrowLeft':
                e.preventDefault();
                moveTiles('left');
                break;
            case 'ArrowRight':
                e.preventDefault();
                moveTiles('right');
                break;
        }
    });

    // Touch controls
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, false);
    
    document.addEventListener('touchend', (e) => {
        if (gameOver) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        // Only register the swipe if it's significant enough
        if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
            if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal swipe
                if (dx > 0) {
                    moveTiles('right');
                } else {
                    moveTiles('left');
                }
            } else {
                // Vertical swipe
                if (dy > 0) {
                    moveTiles('down');
                } else {
                    moveTiles('up');
                }
            }
        }
    }, false);

    // Button event listeners
    newGameBtn.addEventListener('click', initGame);
    tryAgainBtn.addEventListener('click', initGame);
    keepGoingBtn.addEventListener('click', () => {
        winScreen.style.display = 'none';
    });
    newGameWinBtn.addEventListener('click', initGame);

    // Initialize the game
    bestScoreDisplay.textContent = bestScore;
    initGame();
});
