const SHAPES = [
    [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
    ],
    [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0],
    ],
    [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1]
    ],
    [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    [
        [1, 1, 1],
        [0, 1, 0],
        [0, 0, 0]
    ],
    [
        [1, 1, 0],
        [1, 1, 0],
        [0, 0, 0]
    ]
]

const COLORS = [
    "#fff",
    "#00aaff",
    "#dc143c",
    "#32cd32",
    "#ff4500",
    "#ff00ff",
    "#ffea00",
    "#8a2be2"
]

// Audios
const moveSound = new Audio('audio/movedown.wav');
const rotateSound = new Audio('audio/rotate.wav');
const clearSound = new Audio('audio/scored.wav');
const gameOverSound = new Audio('audio/game-over.wav');
const bgSound = new Audio('audio/bg-audio.wav');

const ROWS = 20;
const COLS = 10;

let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let scoreboard = document.querySelector("#score");
let highScoreboard = document.querySelector("#high-score");
let gameInterval;
highScoreboard.innerHTML = "High Score: " + highScore;

let canvas = document.querySelector("#tetris");
let ctx = canvas.getContext("2d");  // canvas pen
ctx.scale(30, 30);

let speed = 500

// Audio Functions
function startBackgroundAudio() {
    bgSound.loop = true;
    bgSound.volume = 0.6;
    bgSound.play().catch(err => console.error("Background audio autoplay blocked:", err));
}

startBackgroundAudio();

function playMoveSound() {
    moveSound.currentTime = 0;
    moveSound.play();
}

function playRotateSound() {
    rotateSound.currentTime = 0;
    rotateSound.play();
}

function playClearSound() {
    clearSound.currentTime = 0;
    clearSound.play();
}

function playGameOverSound() {
    bgSound.pause();
    gameOverSound.currentTime = 0;
    gameOverSound.play();
}

// Preview
let previewCanvas = document.querySelector("#preview");
let previewCtx = previewCanvas.getContext("2d");
previewCtx.scale(30, 30);

let pieceObj = null;
let grid = generateGrid();
let nextPiece = generateRandomPiece();
// console.log(grid); 
// console.log(pieceObj);

function generateRandomPiece() {
    let ran = Math.floor(Math.random() * 7);
    let piece = SHAPES[ran];
    let colorIndex = ran + 1;
    let x = 4;
    let y = 0;
    return { piece, x, y, colorIndex };
}

document.querySelector("#start-button").addEventListener("click", () => {
    const startButton = document.querySelector("#start-button");
    startButton.style.display = "none"; // Hide the button instantly
    // Start the game
    gameInterval = setInterval(newGameState, speed);
    renderPreview();
    bgSound.play();
});


// gameInterval = setInterval(newGameState, speed);
// renderPreview();

function newGameState() {
    checkGrid();    // check if there is any row with all colors filled then we need to remove that row and fill it with white so that other pieces can take that place
    if (pieceObj == null) {
        pieceObj = nextPiece;
        nextPiece = generateRandomPiece();
        renderPreview();
        renderPiece();
    }
    moveDown();
}

function checkGrid() {
    let count = 0;  // for scoring
    let gridRemoved = false;
    for (let i = 0; i < grid.length; i++) {
        let allFilled = true;
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] == 0) allFilled = false;
        }
        if (allFilled) {
            grid.splice(i, 1);
            grid.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // remove the row of colors and shift them down
            // console.log("Grid removed");
            gridRemoved = true;
            count++;
        }
    }

    if (gridRemoved) playClearSound();
    if (count == 1) score += 10;
    else if (count == 2) score += 30;
    else if (count == 3) score += 50;
    else if (count > 3) score += 100;

    scoreboard.innerHTML = "Score: " + score;
    updateSpeed();
    updateHighScore();
}

function updateSpeed() {
    speed = Math.max(100, 500 - Math.floor(score / 50) * 50);
    clearInterval(gameInterval);
    gameInterval = setInterval(newGameState, speed);
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreboard.innerHTML = "High Score: " + highScore;
    }
}

function renderPiece() {
    let piece = pieceObj.piece;
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] == 1) {
                ctx.fillStyle = COLORS[pieceObj.colorIndex];
                ctx.fillRect(pieceObj.x + j, pieceObj.y + i, 1, 1); //to color the piece
            }
        }
    }
}

function renderPreview() {
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    let piece = nextPiece.piece;
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] == 1) {
                previewCtx.fillStyle = COLORS[nextPiece.colorIndex];
                previewCtx.fillRect(j + 1, i + 2, 1, 1); // Draw each block of the piece
            }
        }
    }
}

function moveDown() {
    if (!collision(pieceObj.x, pieceObj.y + 1))
        pieceObj.y += 1;
    else {
        // when the piece has reached the bottom then we'll color that area of grid with the same as piece and again make the piece null
        for (let i = 0; i < pieceObj.piece.length; i++) {
            for (let j = 0; j < pieceObj.piece[i].length; j++) {
                if (pieceObj.piece[i][j] == 1) {
                    let p = pieceObj.x + j;
                    let q = pieceObj.y + i;
                    grid[q][p] = pieceObj.colorIndex;
                }
            }
        }
        if (pieceObj.y == 0) {  // if the pieces touch the top of the grid
            showGameOver(score);
        }
        pieceObj = null;    // again making the piece null for a new piece
    }
    renderGrid();
}

function moveLeft() {
    if (!collision(pieceObj.x - 1, pieceObj.y))
        pieceObj.x -= 1;
    renderGrid();
}

function moveRight() {
    if (!collision(pieceObj.x + 1, pieceObj.y))
        pieceObj.x += 1;
    renderGrid();
}

function rotate() {
    /* 
    Logic behind matrix rotation:
    1. Transpose the matrix by swapping the rows with columns
    2. Reverse each row
    3. This rotates the matrix clockwise
    */

    let rotatedPiece = [];
    let piece = pieceObj.piece;

    // epmty matrix for rotated piece
    for (let i = 0; i < piece.length; i++) {
        rotatedPiece.push([]);
        for (let j = 0; j < piece[i].length; j++) {
            rotatedPiece[i].push(0);
        }
    }

    // transpose
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            rotatedPiece[i][j] = piece[j][i];
        }
    }

    for (let i = 0; i < piece.length; i++) {
        rotatedPiece[i] = rotatedPiece[i].reverse();
    }

    if (!collision(pieceObj.x, pieceObj.y, rotatedPiece))
        pieceObj.piece = rotatedPiece;

    renderGrid();
}

function collision(x, y, rotatedPiece) {
    let piece = rotatedPiece || pieceObj.piece; // if rotated piece is present
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] == 1) {
                let p = x + j;
                let q = y + i;
                if (p >= 0 && p < COLS && q >= 0 && q < ROWS) {
                    // to check if there is collision inside the grid
                    if (grid[q][p] > 0) {
                        return true;
                    }
                }
                else {
                    return true;
                }
            }
        }
    }
    return false;
}

function generateGrid() {
    let grid = [];
    for (let i = 0; i < ROWS; i++) {
        grid.push([]);
        for (let j = 0; j < COLS; j++) {
            grid[i].push(0);
        }
    }
    return grid;
}

function renderGrid() {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            ctx.fillStyle = COLORS[grid[i][j]];
            ctx.fillRect(j, i, 1, 1);
        }
    }
    renderPiece();
}

document.addEventListener("keydown", function (e) {
    let key = e.code // the key which is pressed
    if (key == "ArrowDown") {
        moveDown();
        playMoveSound();
    }
    else if (key == "ArrowLeft") {
        moveLeft();
        playMoveSound();
    }
    else if (key == "ArrowRight") {
        moveRight();
        playMoveSound();
    }
    else if (key == "ArrowUp") {
        rotate();
        playRotateSound();
    }
})

function showGameOver(score) {
    document.getElementById("final-score").textContent = score;
    document.getElementById("game-over").style.display = "block";
    clearInterval(gameInterval);
    playGameOverSound();
}

function closeGameOver() {
    // Reset game or restart
    document.getElementById("game-over").style.display = "none";
    grid = generateGrid();  // again generate grid of white colors to restart the game
    score = 0;
    pieceObj = null;  // Reset the current piece
    nextPiece = generateRandomPiece(); // Generate a new random piece
    gameInterval = setInterval(newGameState, speed); // Restart the game loop
    scoreboard.innerHTML = "Score: " + score; // Update score on screen
    bgSound.play();
}