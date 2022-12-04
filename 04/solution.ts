import { readLinesFromFile } from "../utility";

type Pair = [number, number];

function doesPair1FullyContainPair2(p1: Pair, p2: Pair): boolean {
    const [x1, y1] = p1;
    const [x2, y2] = p2;
    return (x2 >= x1 && y2 <= y1);
}

function doesPair1OverlapPair2(p1: Pair, p2: Pair): boolean {
    const [x1, y1] = p1;
    const [x2, _y2] = p2;
    return (x2 >= x1 && x2 <= y1);
}

function toPairs(line: string): [Pair, Pair] {
    const toPair = (val: string): Pair => {
        const [a, b] = val.split("-").map(Number)
        return [a, b];
    };
    const [l1, l2] = line.split(",");
    return [toPair(l1), toPair(l2)];
}

async function solve() {
    const lines = await readLinesFromFile(__dirname + "/input.txt");
    const pairList = lines.map(toPairs);
    const total1 = pairList.filter((pairs) => {
        const [p1, p2] = pairs;
        return doesPair1FullyContainPair2(p1, p2) || doesPair1FullyContainPair2(p2, p1);
    }).length
    console.log(total1);

    const total2 = pairList.filter((pairs) => {
        const [p1, p2] = pairs;
        return doesPair1OverlapPair2(p1, p2) || doesPair1OverlapPair2(p2, p1);
    }).length
    console.log(total2);

}

solve().catch((err) => {
    console.log("An error occurred", err);
})