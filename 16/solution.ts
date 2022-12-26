import { readLinesFromFile } from "../utility";
const fs = require("fs").promises;

type Valves = Map<string, { flowRate: number, tunnels: string[], open: boolean }>
type PathNode = { key: string, flowRate: number, cost: number };
type Path = PathNode[];

function parseValves(lines: string[]): Valves {
    const valves: Valves = new Map();
    for (const line of lines) {
        const [nameText, tunnelText] = line.split("; ");
        const nameParts = nameText.split(" ");
        const name = nameParts[1];
        const flowRate = Number(nameParts[4].split("=")[1]);
        const tunnelParts = (tunnelText.includes("valves")) ? tunnelText.slice(23) : tunnelText.slice(22);
        const tunnels = tunnelParts.split(", ");
        valves.set(name, { flowRate, tunnels, open: false });
    }
    return valves;
}

function calcCost(source: string, dest: string, valves: Valves): number {
    const visited: Record<string, boolean> = {};
    const distanceMap: Record<string, number | null> = {};
    for (const key of valves.keys()) {
        visited[key] = false;
        distanceMap[key] = null;
    }
    distanceMap[source] = 0;
    const queue = [source];
    while (!visited[dest]) {
        const currNode = queue[0];
        // pop item off queue
        queue.splice(0, 1);
        visited[currNode] = true;
        const neighbours = valves.get(currNode)?.tunnels.filter(n => !visited[n]);
        if (neighbours) {
            for (const neighbour of neighbours) {
                if (!visited[neighbour]) {
                    distanceMap[neighbour] = (distanceMap[currNode] ?? 0) + 1;
                    queue.push(neighbour);
                }
            }
        }
    }
    return distanceMap[dest] ?? 0;

}

function scorePath(path: Path): number {
    return path.reduce((acc, item) => acc + Math.max(0, item.flowRate * item.cost), 0)
}

function findPath(valves: Valves, keys: string[], currPath: Path, cost: number, costMap: Map<string, number>): Path {
    if (cost <= 0) {
        return currPath;
    }
    const source = currPath[currPath.length - 1].key;
    let truePath: Path = currPath;
    let score = scorePath(currPath);
    for (const key of keys) {
        const costToNode = getCostFromMap(valves, source, key, costMap);
        if (costToNode <= cost - 1) {
            const possPath = findPath(
                valves,
                keys.filter(k => k !== key),
                currPath.concat([{ key, cost: cost - costToNode - 1, flowRate: valves.get(key)?.flowRate ?? 0 }]),
                cost - costToNode - 1,
                costMap
            );

            const possScore = scorePath(possPath);
            if (possScore >= score) {
                score = possScore;
                truePath = (possPath);
            }
        }
    }
    return truePath;
}

function solvePart1(valves: Valves) {
    const nonZeroValves = Array.from(valves.entries())
        .filter(([_key, val]) => val.flowRate !== 0)
        .map(([key]) => key);
    const costMap = getCostMap(valves);
    const path = findPath(valves, nonZeroValves, [{ key: "AA", cost: 0, flowRate: 0 }], 30, costMap);
    console.log(path);
    console.log(scorePath(path));
}

function getCostFromMap(valves: Valves, source: string, dest: string, costMap: Map<string, number>): number {
    if (costMap.get(source + dest) !== undefined) {
        return costMap.get(source + dest) as number;
    } else {
        console.log("Reached here");
        const costToNode = calcCost(source, dest, valves);
        costMap.set(source + dest, costToNode);
        return costToNode;
    }
}

function findPath2(
    valves: Valves,
    keys: string[],
    currPath: Path,
    cost: number,
    elephantPath: Path,
    elephantCost: number,
    costMap: Map<string, number>
): [Path, Path] {
    if (cost <= 0 && elephantCost <= 0) {
        return [currPath, elephantPath];
    }

    if (elephantCost <= 0) {
        // elephant finished calculate normal path
        return [findPath(valves, keys, currPath, cost, costMap), elephantPath]
    }

    if (cost <= 0) {
        // normal finished calculate elephant path
        return [currPath, findPath(valves, keys, elephantPath, elephantCost, costMap)]
    }

    const source = currPath[currPath.length - 1].key;
    const elephantSource = elephantPath[elephantPath.length - 1].key;
    let truePath: Path = currPath;
    let trueElPath: Path = elephantPath;
    let score = scorePath(currPath) + scorePath(elephantPath);
    for (const key of keys) {
        const costToNode = costMap.get(source + key) ?? 0;
        if (costToNode <= cost - 1) {
            // remove curr key from elephant choice
            const elephantKeys = keys.filter(k => k !== key);
            for (const ekey of elephantKeys) {
                const costToElephantNode = costMap.get(elephantSource + ekey) ?? 0;
                const [possPath, possElPath] = findPath2(
                    valves,
                    keys.filter(k => !(k === key ||k === ekey)),
                    currPath.concat([{ key, cost: cost - costToNode - 1, flowRate: valves.get(key)?.flowRate ?? 0 }]),
                    cost - costToNode - 1,
                    elephantPath.concat([{ key: ekey, cost: elephantCost - costToElephantNode - 1, flowRate: valves.get(ekey)?.flowRate ?? 0 }]),
                    elephantCost - costToElephantNode - 1,
                    costMap
                );
                const possScore = scorePath(possPath) + scorePath(possElPath);
                if (possScore > score) {
                    score = possScore;
                    truePath = possPath;
                    trueElPath = possElPath;
                }
            }
        }
    }
    return [truePath, trueElPath];
}
function getCostMap(valves: Valves): Map<string, number> {
    const costMap: Map<string, Map<string, number>> = new Map();
    for (const [key, valveData] of valves.entries()) {
        for (const dest of valveData.tunnels) {
            if (costMap.get(key)) {
                costMap.get(key)?.set(dest, 1);
            } else {
                costMap.set(key, new Map([[dest, 1]]));
            }
        }
    }

    for (const key of valves.keys()) {
        costMap.get(key)?.set(key, 0);
    }

    for (const k of valves.keys()) {
        for (const i of valves.keys()) {
            for (const j of valves.keys()) {
                const a = costMap.get(i)?.get(j) ?? Infinity;
                const b = costMap.get(i)?.get(k) ?? Infinity;
                const c = costMap.get(k)?.get(j) ?? Infinity;
                if (a > b + c) {
                    costMap.get(i)?.set(j, b + c);
                }
            }
        }
    }

    const finalMap: Map<string, number> = new Map();
    for (const key of costMap.keys()) {
        for (const [child, cost] of costMap.get(key) ?? []) {
            finalMap.set(key + child, cost);
        }
    }
    return finalMap;
}

function solvePart2(valves: Valves) {
    const nonZeroValves = Array.from(valves.entries())
        .filter(([_key, val]) => val.flowRate !== 0)
        .map(([key]) => key);
    
    const costMap = getCostMap(valves);
    const [path, elephantPath] = findPath2(
        valves,
        nonZeroValves,
        [{ key: "AA", cost: 0, flowRate: 0 }],
        26,
        [{ key: "AA", cost: 0, flowRate: 0 }],
        26,
        costMap
    );
    console.log({ path, elephantPath });
    console.log(scorePath(path) + scorePath(elephantPath));
}

async function writeToDotFile(valves: Valves, name: string) {
    let stringData = "graph {\n";
    for (const [key, valveData] of valves.entries()) {
        stringData += `${key} [label = "${key} (${valveData.flowRate})"]\n`;
    }
    const written: Set<string> = new Set();
    for (const [key, valveData] of valves.entries()) {
        const children = valveData.tunnels
            .filter(t => !written.has(t))
            .join(", ");
        stringData += `${key} -- {${children}}\n`;
        written.add(key);
    }
    stringData += "}";

    await fs.writeFile(`16/${name}.dot`, stringData);
}
/*

test_2.txt gotten from here: https://www.reddit.com/r/adventofcode/comments/znklnh/2022_day_16_some_extra_test_cases_for_day_16/
Part 1: 2640
2640 |AA|FA|GA|HA|IA|JA|KA|LA|MA|NA|OA|PA
24 * 10 + 22 * 12 + 20 * 14 + 18 * 16 + 16 * 18 + 14 * 20 + 12 * 22 + 10 * 24 + 8 * 26 + 6 * 28 + 4 * 30

Part 2: 2670
1240 |AA|DA|EA|FA|GA|HA|IA|JA|CA
1430 |AA|KA|LA|MA|NA|OA|PA
*/
async function solve() {
    const lines = await readLinesFromFile(__dirname + "/input.txt");
    const valves = parseValves(lines);
    console.log("Started at", new Date());
    console.time();
    solvePart1(valves);
    console.timeEnd();
    console.time();
    solvePart2(valves);
    console.timeEnd();
}

solve().catch(err => console.log("An error occurred", err));
