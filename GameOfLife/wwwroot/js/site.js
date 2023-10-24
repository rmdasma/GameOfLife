// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
function Cell(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
}

let WIDTH = 800;
let HEIGHT = 500;
const RES = 10;

const DEAD_CELL = 0;
const LIVING_CELL = 1;
const BORDER = 2;

let grid;
let isRunning = false;
let generation = 0;

window.addEventListener('load', function () {
    if (window.innerWidth < 840) {
        WIDTH = window.innerWidth - 100;
        WIDTH = WIDTH - WIDTH % 100;
        HEIGHT = window.innerHeight - 40;
        HEIGHT = HEIGHT - HEIGHT % 100;
    }
    document.getElementById('canvas').height = HEIGHT;
    document.getElementById('canvas').width = WIDTH;
    generation = 0;
    initialDraw();
});

function switchButtons() {
    document.getElementById('reset').disabled = isRunning;
}

window.addEventListener('resize', function () {
    if (window.innerWidth < 840) {
        WIDTH = window.innerWidth - 100;
        WIDTH = WIDTH - WIDTH % 100;
        HEIGHT = window.innerHeight - 40;
        HEIGHT = HEIGHT - HEIGHT % 100;
    }
    else {
        HEIGHT = 500;
        WIDTH = 800;
    }
    document.getElementById('canvas').height = HEIGHT;
    document.getElementById('canvas').width = WIDTH;
    generation = 0;
    initialDraw();
    if (isRunning) {
        isRunning = false;
        document.getElementById('startStop').textContent = 'Start';
        switchButtons();
    }
});

document.getElementById('canvas').addEventListener('click', function (e) {
    // Which box did user click on?
    const row = Math.floor(e.offsetX / RES);
    const col = Math.floor(e.offsetY / RES);

    // Don't allow changes while simulation is running
    if (isRunning) {
        return;
    }

    // Case user clicked on a dead cell
    if (grid[row][col] === DEAD_CELL) {
        // Generation needs to be resetted
        generation = 0;

        grid[row][col] = LIVING_CELL;
        drawCell('#2B823A', 'LightGray', 1, row * RES, col * RES, RES, RES);
    } else if (grid[row][col] === LIVING_CELL) {
        // Generation needs to be resetted
        generation = 0;

        grid[row][col] = DEAD_CELL;
        drawCell('white', 'LightGray', 1, row * RES, col * RES, RES, RES);
    }
});

document.getElementById('startStop').addEventListener('click', function () {
    // Case user wants to start simulation
    if (!isRunning) {
        const cols = WIDTH / RES;
        const rows = HEIGHT / RES;
        draw(cols, rows);

        isRunning = true;
        document.getElementById('startStop').textContent = 'Stop';
        switchButtons();
    } else {
        isRunning = false;
        document.getElementById('startStop').textContent = 'Start';
        switchButtons();
    }
});

document.getElementById('reset').addEventListener('click', function () {
    if (!isRunning) {
        // Generation needs to be resetted
        generation = 0;

        createGrid(WIDTH / RES, HEIGHT / RES);
        draw(WIDTH / RES, HEIGHT / RES);
    }
});


function initialDraw() {
    const cols = WIDTH / RES;
    const rows = HEIGHT / RES;
    grid = createArray(cols, rows);

    // Field edge is getting filled up with "2"
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j] = BORDER;
        }
    }

    // Field gets filled up with "0" = dead cells
    for (let i = 1; i < cols - 1; i++) {
        for (let j = 1; j < rows - 1; j++) {
            grid[i][j] = DEAD_CELL;
        }
    }

    draw(cols, rows);
}

function draw(cols, rows) {
    // Draw
    let cells = new Array();
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const x = i * RES;
            const y = j * RES;
            if (grid[i][j] === DEAD_CELL) {
                // Dead cells are white
                drawCell('white', 'LightGray', 1, x, y, RES, RES);
            } else if (grid[i][j] === LIVING_CELL) {
                // Living cells are #2B823A (green)
                drawCell('#2B823A', 'LightGray', 1, x, y, RES, RES);
            } else {
                // Border cells are #FF0000 (red)
                drawCell('#FF0000', 'LightGray', 1, x, y, RES, RES);
            }

            cells.push(new Cell(i, j, grid[i][j]));
        }
    }

    //Apply rules from backend api
    $.ajax({
        url: '/api/generation',
        type: 'POST',
        data: JSON.stringify(cells),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (data) {
            if (data === 'Empty') {
                console.log('Empty Grid');
            }
            else {
                if (isRunning) {
                    const newArray = createArray(cols, rows);
                    data.forEach((element) => {
                        newArray[element.x][element.y] = element.value;
                    });
                    for (let i = 1; i < cols - 1; i++) {
                        for (let j = 1; j < rows - 1; j++) {
                            grid[i][j] = newArray[i][j];
                        }
                    }

                    generation++;
                    if (isRunning) {
                        setTimeout(function () {
                            draw(cols, rows);
                        }, 500);
                    }
                }
            }
        }
    })
}

function drawCell(fillStyle, strokeStyle, lineWidth, x, y, width, height) {
    const ctx = document.getElementById('canvas').getContext('2d');
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();

    // Draw border of color strokeStyle
    ctx.rect(x, y, width, height);

    // Fill cell with color fillStyle
    ctx.fill();
    ctx.stroke();
}

function createGrid(cols, rows) {
    grid = createArray(cols, rows);

    // Field edge is getting filled up with "2"
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j] = BORDER;
        }
    }

    // Field gets filled up with "0" = dead cells
    for (let i = 1; i < cols - 1; i++) {
        for (let j = 1; j < rows - 1; j++) {
            grid[i][j] = DEAD_CELL;
        }
    }
}

/**
 * Creates an empty 2d-array
 *
 * @param {int} cols      Number of columns
 * @param {int} rows      Number of rows
 *
 * @return {Obj} array    newly created array
 */
function createArray(cols, rows) {
    const array = new Array(cols);
    for (let i = 0; i < cols; i++) {
        array[i] = new Array(rows);
    }
    return array;
}