import {readLinesFromFile} from "../utility";
type Position = {x: number, y: number};

interface Sensor {
    position: Position;
    closestBeacon: Position;
    manhattanDistance: number;
};

interface Result {
    minX: number;
    maxX: number;
}

function calcManhattanDistance(pos1: Position, pos2: Position) {
    const {x, y} = pos1;
    const {x:x1, y:y1} = pos2;

    return Math.abs(x - x1) + Math.abs(y - y1);
}

function findXValue(lineStart: Position, lineEnd: Position, y: number): number | null {
    const {x:sx, y:sy} = lineStart;
    const {x:ex, y:ey} = lineEnd;
    if (Math.min(sy, ey) > y || y > Math.max(sy, ey)) {
        return null;
    }

    const m = (ey - sy)/(ex -sx);
    const intercept = sy - m * sx;
    const possX = (y - intercept) / m;
    const minX = Math.min(sx, ex);
    const maxX = Math.max(sx, ex);
    if (minX <= possX && possX <= maxX) {
        return possX;
    }
    return null;
}

function calcInvalidPositions(sensor: Sensor, y: number): Result | null {
    const {manhattanDistance} = sensor;
    const p1 = {x: sensor.position.x + manhattanDistance, y: sensor.position.y};
    const p2 = {x: sensor.position.x - manhattanDistance, y: sensor.position.y};
    const p3 = {x: sensor.position.x, y: sensor.position.y - manhattanDistance};
    const p4 = {x: sensor.position.x, y: sensor.position.y + manhattanDistance};
    const l1: [Position, Position] = [p1, p3];
    const l2: [Position, Position] = [p2, p3];
    const l3: [Position, Position] = [p2, p4];
    const l4: [Position, Position] = [p1, p4];
    const pair1 = [l1, l2]
        .map(([p, q]) => findXValue(p, q, y))
        .filter(val => val !== null) as number[];
    if (pair1.length === 2) {
        return {minX: pair1[1], maxX: pair1[0]};
    } else {
        const pair2 = [l3, l4]
            .map(([p, q]) => findXValue(p, q, y))
            .filter(val => val !== null) as number[];
        if (pair2.length === 2) {
            return {minX: pair2[0], maxX: pair2[1]}
        }
    }
    return null;
}


// check if r2 is contained in r1
function isRangeSubset(r1: Result, r2: Result): boolean {
    const {minX:sx1, maxX:sx2} = r1;
    const {minX:ex1, maxX:ex2} = r2;
    return ex1 >= sx1 && ex2 <= sx2;
}

function reducer(acc: Result[], r: Result): Result[] {
    const exists = acc.find(result => isRangeSubset(result, r));
    if (exists) {
        return acc;
    }
    const newList = acc.filter(result => !isRangeSubset(r, result));
    newList.push(r);
    return newList;
}

function reducer2(acc: Result[], r: Result): Result[] {
    if (acc.length === 0) {
        return [r];
    }
    const last = acc[acc.length - 1];
    if (last.minX <= r.minX && r.minX <= last.maxX) {
        const removedLast = acc.slice(0, -1);
        removedLast.push({minX: last.minX, maxX: r.maxX});
        return removedLast;
    } else {
        acc.push(r);
        return acc;
    }
}

function calcTotal(value: {fixedXValues: Set<number>, results: Result[]}) {
    const values = value.results.reduce((acc, result) => acc + (result.maxX - result.minX + 1), 0);
    return values - value.fixedXValues.size;
}

function calcAllInvalidPositions(sensors: Sensor[], allPositions: Position[], y: number, maxVal?: number): {fixedXValues: Set<number>, results: Result[]} {

    const fixedXValues: Set<number> = new Set(allPositions.filter(pos => pos.y === y).map(p => p.x));
    const results: Result[] = [];
    for (const sensor of sensors) {
        const result = calcInvalidPositions(sensor, y);
        if (result !== null) {
            results.push(result);
        }
    }

    const uniqResults = results.reduce(reducer, []);
    uniqResults.sort((r1, r2) => r1.maxX - r2.maxX);
    const finResults = uniqResults.reduce(reducer2, []);
    return {results: finResults, fixedXValues};
}


function calcNumberOfInvalidPositions2(sensors: Sensor[], maxVal: number): number {

    const takenPositions = sensors
        .map(s => s.closestBeacon)
        .concat(sensors.map(s => s.position));
    const possRange = {minX: 0, maxX: maxVal};
    for (let y = 0; y <= maxVal; y++) {
        const {fixedXValues, results} = calcAllInvalidPositions(sensors, takenPositions, y);
        for (const range of results) {
            if (range.maxX < 0 || range.minX > maxVal || isRangeSubset(range, possRange) || isRangeSubset(possRange, range)) {
                continue;
            }
            for (let x = 0; x <= maxVal; x++) {
                if (!fixedXValues.has(x) && !(range.minX <= x && x <= range.maxX)) {
                    console.log({x, y});
                    return x * 4_000_000 + y;
                }   
            }
        }
    }
    return -1;

}

function parseSensor(line: string): Sensor {
    const [sensorText, beaconText] = line.split(": ");
    const [slicedSensorX, slicedSensorY] = sensorText.slice(12).split(", ");
    const sensorX = Number(slicedSensorX);
    const sensorY = Number(slicedSensorY.slice(2));
    const [slicedBeaconX, slicedBeaconY] = beaconText.slice(23).split(", ");
    const beaconX = Number(slicedBeaconX);
    const beaconY = Number(slicedBeaconY.slice(2));
    const position = {x: sensorX, y: sensorY};
    const closestBeacon = {x: beaconX, y: beaconY};
    const manhattanDistance = calcManhattanDistance(position, closestBeacon);
    return {position, closestBeacon, manhattanDistance};
}

async function solve() {
    const lines = await readLinesFromFile(__dirname + "/input.txt");
    const sensors = lines.map(parseSensor);
    console.time();
    const allPositions = sensors.map(s => s.closestBeacon).concat(sensors.map(s => s.position));
    const part1Results = calcAllInvalidPositions(sensors, allPositions, 10);
    console.log(calcTotal(part1Results))
    console.log(calcNumberOfInvalidPositions2(sensors, 4_000_000));
    console.timeEnd();
}

solve().catch(err => console.log("An error occurred", err));
