import { readLinesFromFile } from "../utility";

// row wise grid
type Grid = number[][];


function createGrid(lines: string[]): Grid {
    return lines.map((line) => line.split("").map(Number))
}

function createVisbilityGrid(grid: Grid): boolean[][] {
    return grid.map((row, i) => row.map((_c, j) => i === 0 || i === grid.length - 1 || j === 0 || j === grid[0].length - 1))
}

function getVisibleTreeCount(grid: Grid): number {
    const visibleGrid = createVisbilityGrid(grid);
    // top
    for (let i = 1; i < grid.length - 1; i++) {
        for (let j = 1; j < grid[0].length - 1; j++) {
            visibleGrid[i][j] = isVisible(grid, i , j);
        }
    }

    // console.log(visibleGrid);
    return visibleGrid
        .map((row) => row.filter(x => x === true).length)
        .reduce((x, y) => x + y, 0);
}

function isVisible(grid: Grid, row: number, col: number): boolean {
    // top 
    const printLog = (message: any) => {
        // if (row === 1 && col === 1) {
        //     console.log(message)
        // }
    }
    let topVisible: boolean | null = null;
    printLog("Top Values");
    for (let i = row - 1; i >= 0; i--) {
        if (topVisible == null) {
            topVisible = true;
        }
        printLog(grid[i][col])
        topVisible = topVisible && grid[i][col] < grid[row][col];
    }

    // bottom
    let bottomVisible: boolean | null = null;
    printLog("Bottom Values");
    for (let i = row + 1; i < grid.length; i++) {
        if (bottomVisible == null) {
            bottomVisible = true;
        }
        printLog(grid[i][col])
        bottomVisible = bottomVisible && grid[i][col] < grid[row][col];
    }
    
    // left
    let leftVisible: boolean | null = null;
    printLog("Left Values");
    for (let j = col - 1; j >= 0; j--) {
        if (leftVisible == null) {
            leftVisible = true;
        }
        printLog(grid[row][j]);
        leftVisible = leftVisible && grid[row][j] < grid[row][col];
    }

    // right
    let rightVisible: boolean | null = null;
    printLog("Right Values");
    for (let j = col + 1; j < grid[0].length; j++) {
        if (rightVisible == null) {
            rightVisible = true;
        }
        printLog(grid[row][j]);
        rightVisible = rightVisible && grid[row][j] < grid[row][col];
    }

    printLog({topVisible, bottomVisible, leftVisible, rightVisible})
    return (topVisible != null && topVisible) ||
        (bottomVisible != null && bottomVisible) ||
        (leftVisible != null && leftVisible) ||
        (rightVisible != null && rightVisible);
}

function getVisibleTreeCountNaive(grid: Grid): number {
    return 0;
}

async function solve() {
    const lines = await readLinesFromFile(__dirname + "/input.txt");
    const grid = createGrid(lines);
    console.log(getVisibleTreeCount(grid));

}

solve().catch(err => console.log("An error occurred", err))