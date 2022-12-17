import { readLinesFromFile } from "../utility";
type Grid = number[][];
type Position = [number, number]

function findStartPos(grid: Grid): Position {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j] === 0) {
                return [i, j];
            }
        }
    }
    return [-1, -1];
}

function getTrueElevation(elevation: number): number {
    // Treat 0 as 1 and -1 as 26
    switch (elevation) {
        case 0:
            return 1;
        case -1:
            return 26;
        default:
            return elevation;
    }
}

function checkPosition(elevation: number, pos: Position, grid: Grid): Position | null {
    const [x, y] = pos;
    if (0 > x || x >= grid.length || 0 > y || y >= grid[0].length) {
        return null;
    }
    const trueElevation = getTrueElevation(grid[x][y]);
    if (trueElevation <= elevation + 1) {
        return pos;
    }
    
    return null;
}

function getNeighbours(pos: Position, grid: Grid): Position[] {
    const [x, y] = pos;
    const elevation = getTrueElevation(grid[x][y]);

    const up = checkPosition(elevation, [x + 1, y], grid);
    const down = checkPosition(elevation, [x - 1, y], grid);
    const left = checkPosition(elevation, [x, y + 1], grid);
    const right = checkPosition(elevation, [x, y - 1], grid);

    return [up, down, left, right].filter(x => x != null) as Position[];
}

function dijsktra(grid: Grid): number {
    const visited = grid.map(row => row.map(() => false));
    const distance: (number|null)[][] = grid.map(row => row.map(() => null));
    const startPos = findStartPos(grid);
    const [startX, startY] = startPos;
    visited[startX][startY] = true;
    distance[startX][startY] = 0;
    let steps = 0;
    const queue: Position[] = [startPos]
    while (queue.length !== 0) {
        // console.log({queue});
        const [sx, sy] = queue[0];
        const pos = queue[0];
        queue.shift();
        const neighbours = getNeighbours(pos, grid);
        for (const [x, y] of neighbours) {
            if (!visited[x][y]) {
                visited[x][y] = true;
                // @ts-ignore
                distance[x][y] = distance[sx][sy] + 1;
                queue.push([x, y]);

                if (grid[x][y] === -1) {
                    return distance[x][y] as number;
                }
            }
        }
    }
    console.log(grid[20][88]);
    console.log(distance[20][88]);
    return 0;

}

async function solve() {
    const lines = await readLinesFromFile(__dirname + "/input.txt");
    const grid: Grid = lines.map(line => line.split("").map(l => {
        switch (l) {
            case "S":
                return 0;
            case "E":
                return -1;
            default:
                return l.charCodeAt(0) - 96;
        }
    }))
    console.log(dijsktra(grid));
}

solve().catch(err => console.log("An error occurred", err));
