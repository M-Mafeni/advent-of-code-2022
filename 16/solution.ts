import {readLinesFromFile} from "../utility";
const fs = require("fs").promises;

type Valves = Map<string, {flowRate: number, tunnels: string[], open: boolean}>
type PathNode = {key: string, flowRate: number, cost: number};
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
        valves.set(name, {flowRate, tunnels, open: false});
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
        queue.splice(0,1);
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

function findPath(valves: Valves, keys: string[], source: string, currPath: Path, cost: number): Path {
    if (cost <= 0) {
        return currPath;
    }
    let truePath: Path = currPath;
    let score = scorePath(currPath);
    for (const key of keys) {
        const costToNode = calcCost(source, key, valves);
        if (costToNode <= cost - 1) {
            const possPath = findPath(
                valves,
                keys.filter(k => k !== key),
                key,
                currPath.concat([{key, cost: cost - costToNode - 1, flowRate: valves.get(key)?.flowRate ?? 0}]),
                cost - costToNode - 1
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

    const path = findPath(valves, nonZeroValves, "AA", [{key:"AA", cost: 0, flowRate: 0}], 30);
    console.log(path);
    console.log(scorePath(path));
}

async function writeToDotFile(valves: Valves, name: string) {
    let stringData = "graph {\n";
    // for ()
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
    stringData+= "}";
    
    await fs.writeFile(`16/${name}.dot`, stringData);
}
/*

test_2.txt
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
    solvePart1(valves);
}

solve().catch(err => console.log("An error occurred", err));
