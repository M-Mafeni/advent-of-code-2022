import {readLinesFromFile} from "../utility";
type Position = {x: number, y: number};

interface Sensor {
    position: Position;
    closestBeacon: Position;
};

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
    if (Math.min(sx, ex) <= possX && possX <= Math.max(sx, ex)) {
        return possX;
    }
    return null;
}

function calcInvalidPositions(sensor: Sensor, y: number, fixedXValues: Set<number>, foundXs: Set<number>) {
    const manhattanDistance = calcManhattanDistance(sensor.position, sensor.closestBeacon);
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
        for (let x = pair1[1]; x <= pair1[0]; x++) {
            if (!fixedXValues.has(x)) {
                foundXs.add(x);
            }
        }
    } else {
        const pair2 = [l3, l4]
            .map(([p, q]) => findXValue(p, q, y))
            .filter(val => val !== null) as number[];
        if (pair2.length === 2) {
            for (let x = pair2[0]; x <= pair2[1]; x++) {
                if (!fixedXValues.has(x)) {
                    foundXs.add(x);
                }
            }
        }
    }
}

function calcNumberOfInvalidPositions(sensors: Sensor[], y: number): number {

    const fixedXValues = new Set(
        sensors
        .map(s => s.closestBeacon)
        .concat(sensors.map(s => s.position))
        .filter(pos => pos.y === y)
        .map(pos => pos.x)
    );

    const impossXs: Set<number> = new Set();
    for (const sensor of sensors) {
        calcInvalidPositions(sensor, y, fixedXValues, impossXs);
    }

    return impossXs.size;
}

function parseSensor(line: string): Sensor {
    const [sensorText, beaconText] = line.split(": ");
    const [slicedSensorX, slicedSensorY] = sensorText.slice(12).split(", ");
    const sensorX = Number(slicedSensorX);
    const sensorY = Number(slicedSensorY.slice(2));
    const [slicedBeaconX, slicedBeaconY] = beaconText.slice(23).split(", ");
    const beaconX = Number(slicedBeaconX);
    const beaconY = Number(slicedBeaconY.slice(2));
    return {position: {x: sensorX, y: sensorY}, closestBeacon: {x: beaconX, y: beaconY}};
}

async function solve() {
    const lines = await readLinesFromFile(__dirname + "/input.txt");
    const sensors = lines.map(parseSensor);
    console.time();
    console.log(calcNumberOfInvalidPositions(sensors, 2000000));
    console.timeEnd();
}

solve().catch(err => console.log("An error occurred", err));
