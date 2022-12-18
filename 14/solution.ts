import {readLinesFromFile} from "../utility";

type Position = [number, number];
type Rock = Position[];

function inRange(minNum: number, maxNum: number, x: number) {
    return minNum <= x && x <= maxNum
}

function positionIsBlockedByRock(rock: Rock, pos: Position): boolean {
    const [x, y] = pos;
    for (let i = 0; i < rock.length - 1; i++) {
        const [sx, sy] = rock[i];
        const [ex, ey] = rock[i + 1];
        // ex < sx
        const bothPlus = inRange(sx, ex, x) && inRange(sy, ey, y);
        const xNeg = inRange(ex, sx, x) && inRange(sy, ey, y);
        const yNeg = inRange(sx, ex, x) && inRange(ey, sy, y);
        const bothNeg = inRange(ex, sx, x) && inRange(ey, sy, y);
        if (bothPlus || xNeg || yNeg || bothNeg) {
            return true;
        }
    }
    return false;
}

function positionIsBlocked(rocks: Rock[], fallenSand: Position[], pos: Position): boolean {
    const [x, y] = pos;
    const isBlockedBySand = fallenSand.some(val => val[0] === x && val[1] === y);
    if (isBlockedBySand) {
        return true;
    }

    return rocks.some((rock) => positionIsBlockedByRock(rock, pos)); 
}

function getLowestYPointRocks(rocks: Rock[]): number {
    return Math.max(...rocks.map(r => Math.max(...r.map(x => x[1]))))
}

function calcUnitsTillInfinity(rocks: Rock[]): number {
    const fallenSand: Position[] = [];
    const lowestYPoint = getLowestYPointRocks(rocks);
    while (true) {
        let sandPos: Position = [500, 0];
        let isBlocked = false;
        while (!isBlocked) {
            const [x, y] = sandPos;
            if (y > lowestYPoint) {
                return fallenSand.length;
            }
            const down: Position = [x, y + 1];
            const downLeft: Position = [x - 1, y + 1];
            const downRight: Position = [x + 1, y + 1];
            if (positionIsBlocked(rocks, fallenSand, down)) {
                if (positionIsBlocked(rocks, fallenSand, downLeft)) {
                    if(positionIsBlocked(rocks, fallenSand, downRight)) {
                        isBlocked = true;
                        fallenSand.push(sandPos);
                    } else {
                        sandPos = downRight;
                    }
                } else {
                    sandPos = downLeft;
                }
            } else {
                sandPos = down;
            }
        }
    }

}

function parseRock(line: string): Rock {
    return line.split(" -> ").map(pair => {
        const [x, y] = pair.split(",").map(Number);
        return [x, y];
    })
}

async function solve() {
    const lines = await readLinesFromFile(__dirname + "/input.txt");
    const rocks = lines.map(parseRock);
    console.log(calcUnitsTillInfinity(rocks));
}

solve().catch(err => console.log("An error occurred", err));
