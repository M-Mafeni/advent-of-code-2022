import {readLinesFromFile} from "../utility";

type Position = [number, number];
type Rock = Position[];
type SandMap = Map<number, Map<number, boolean>>;

function inRange(minNum: number, maxNum: number, x: number) {
    return minNum <= x && x <= maxNum
}

function positionIsBlockedByRock(rock: Rock, pos: Position): boolean {
    const [x, y] = pos;
    for (let i = 0; i < rock.length - 1; i++) {
        const [sx, sy] = rock[i];
        const [ex, ey] = rock[i + 1];
        // ex < sx
        const xInc = inRange(sx, ex, x); 
        const xDec = inRange(ex, sx, x); 
        const yInc = inRange(sy, ey, y); 
        const yDec = inRange(ey, sy, y); 

        const bothPlus = xInc && yInc;
        const xNeg = xDec && yInc;
        const yNeg = xInc && yDec;
        const bothNeg = xDec && yDec;
        if (bothPlus || xNeg || yNeg || bothNeg) {
            return true;
        }
    }
    return false;
}

function positionIsBlocked(rocks: Rock[], fallenSand: SandMap, pos: Position): boolean {
    const [x, y] = pos;
    const isBlockedBySand = fallenSand.has(x) ? fallenSand.get(x)?.has(y) : false;
    if (isBlockedBySand) {
        return true;
    }

    return rocks.some((rock) => positionIsBlockedByRock(rock, pos)); 
}

function getLowestYPointRocks(rocks: Rock[]): number {
    return Math.max(...rocks.map(r => Math.max(...r.map(x => x[1]))))
}

function addPosToMap(sandMap: Map<number, Map<number, boolean>>, pos: Position) {
    const [x, y] = pos;
    if (sandMap.has(x)) {
        const subMap = sandMap.get(x);
        subMap?.set(y, true);
    } else {
        sandMap.set(x, new Map([[y, true]]))
    }
}

function calcUnitsTillInfinity(rocks: Rock[]): number {
    const fallenSandMap: Map<number, Map<number, boolean>> = new Map();
    const lowestYPoint = getLowestYPointRocks(rocks);
    const floor = lowestYPoint + 2;
    while (true) {
        let sandPos: Position = [501, 0];
        let isBlocked = false;
        while (!isBlocked) {
            const [x, y] = sandPos;
            // Uncomment for part 1
            // if (y > lowestYPoint) {
            //     let s = 0;
            //     for (const m of fallenSandMap.values()) {
            //         s += m.size;
            //     }
            //     return s;
            // }

            // Part 2 check
            if (y + 1 === floor) {
                isBlocked = true;
                // fallenSand.push(sandPos);
                addPosToMap(fallenSandMap, sandPos)
                break;
            }

            const down: Position = [x, y + 1];
            const downLeft: Position = [x - 1, y + 1];
            const downRight: Position = [x + 1, y + 1];
            if (positionIsBlocked(rocks, fallenSandMap, down)) {
                if (positionIsBlocked(rocks, fallenSandMap, downLeft)) {
                    if(positionIsBlocked(rocks, fallenSandMap, downRight)) {
                        // Part 2 check
                        if (x === 500 && y === 0) {
                            let s = 0;
                            for (const m of fallenSandMap.values()) {
                                s += m.size;
                            }
                            return s + 1;
                        }
                        isBlocked = true;
                        // fallenSand.push(sandPos);
                        addPosToMap(fallenSandMap, sandPos);
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
    console.time();
    console.log(calcUnitsTillInfinity(rocks));
    console.timeEnd();
}

solve().catch(err => console.log("An error occurred", err));
