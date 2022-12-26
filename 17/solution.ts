import {readContentsFromFile, readLinesFromFile} from "../utility";
interface Position {
    x: number;
    y: number;
}

type Grid = Position[];
type Rock = Position[];

function moveRock(rock: Rock, direction: string, grid: Grid): Rock {
    if (direction === "<") {
        const makeMove = rock.every(pos => pos.x - 1 >= 0 && !grid.find(rockPos => rockPos.y === pos.y && rockPos.x === pos.x - 1));
        if (makeMove) {
            return rock.map(pos => ({...pos, x: pos.x - 1}));
        }
    } else if (direction === ">") {
        const makeMove = rock.every(pos => pos.x + 1 <= 6 && !grid.find(rockPos => rockPos.y === pos.y && rockPos.x === pos.x + 1));
        if (makeMove) {
            return rock.map(pos => ({...pos, x: pos.x + 1}));
        }
    }
    return rock;
}

function makeRockFall(initialRock: Position[], grid: Grid, directions: String, dirIndex: number): [Grid, number] {
    let stopped = false;
    let dirCounter = dirIndex;
    let changeDirection = true;
    let rock = initialRock;
    while (!stopped) {
        if (changeDirection) {
            // console.log("Move rock ", directions[dirCounter]);
            rock = moveRock(rock, directions[dirCounter], grid);
            dirCounter = (dirCounter + 1) % directions.length;
        } else {
            const makeMove = rock.every(pos => grid.find(gridPos => gridPos.x === pos.x && gridPos.y === pos.y - 1) === undefined);
            if (makeMove) {
                rock = rock.map(pos => ({...pos, y: pos.y - 1}));
            } else {
                stopped = true;
            }
        }
        changeDirection = !changeDirection;
    }
    return [grid.concat(rock), dirCounter];
}

function getHighestPos(grid: Grid): number {
    return Math.max(...grid.map(p => p.y));
}

function getRock(grid: Grid, rockIndex: number): Rock {
    const highestPos = getHighestPos(grid);
    switch (rockIndex) {
        case 0: // vertical line
            return [
                {x: 2, y: highestPos + 4},
                {x: 3, y: highestPos + 4},
                {x: 4, y: highestPos + 4},
                {x: 5, y: highestPos + 4},
            ];
        case 1: // cross
            return [
                // top point
                {x: 3, y: highestPos + 6},
                // vertical line
                {x: 2, y: highestPos + 5},
                {x: 3, y: highestPos + 5},
                {x: 4, y: highestPos + 5},
                // bottom point
                {x: 3, y: highestPos + 4},
            ];
        case 2: // mirrored L
            return [
                {x: 2, y: highestPos + 4},
                {x: 3, y: highestPos + 4},
                {x: 4, y: highestPos + 4},
                {x: 4, y: highestPos + 5},
                {x: 4, y: highestPos + 6},
            ];
        case 3: // horizontal line
            return [
                {x: 2, y: highestPos + 4},
                {x: 2, y: highestPos + 5},
                {x: 2, y: highestPos + 6},
                {x: 2, y: highestPos + 7},
            ];
        case 4: // square
            return [
                {x: 2, y: highestPos + 4},
                {x: 2, y: highestPos + 5},
                {x: 3, y: highestPos + 4},
                {x: 3, y: highestPos + 5},
            ]

    }
    throw new Error("Failed to get rock");
}

function displayGrid(highestPos: number, grid: Grid) {
    for (let y = highestPos + 2; y >= 0; y--) {
        let row = (y === 0) ? "+" : "|";
        for (let x = 0; x < 7; x++) {
            if (y === 0) {
                row += "-"
            } else {
                if (grid.find(p => p.x === x && p.y === y)) {
                    row += "#"
                } else {
                    row += "."
                }
            } 
        }
        row += (y === 0) ? "+" : "|"
        console.log(row);
    }
}

function makeRocksFall(initGrid: Grid, directions: string): Grid {
    let rockIndex = 0;
    let noOfRocksFallen = 0;
    let grid = initGrid;
    let dirCounter = 0;
    while (noOfRocksFallen < 2022) {
        const rock = getRock(grid, rockIndex);
        const [newGrid, newDirCounter] = makeRockFall(rock, grid, directions, dirCounter);
        grid = newGrid;
        dirCounter = newDirCounter;
        // displayGrid(getHighestPos(grid), grid);
        // console.log();
        rockIndex = (rockIndex + 1) % 5;
        noOfRocksFallen++;
    }
    return grid;
}

async function solve() {
    const directions = await readContentsFromFile(__dirname + "/input.txt");
    const grid = [
        {x: 0, y: 0},
        {x: 1, y: 0},
        {x: 2, y: 0},
        {x: 3, y: 0},
        {x: 4, y: 0},
        {x: 5, y: 0},
        {x: 6, y: 0},
    ];
    console.time();
    const finalGrid = makeRocksFall(grid, directions);
    console.timeEnd();
    console.log(getHighestPos(finalGrid));
}

solve().catch(err => console.log("An error occurred", err));
