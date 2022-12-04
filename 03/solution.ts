import { readLinesFromFile } from "../utility";

function toCompartments(line: string): [string, string] {
    const mid = line.length / 2;
    return [line.slice(0,mid), line.slice(mid, line.length)];
}


function getPriority(x: String): number {
    const code = x.charCodeAt(0);

    if (65 <= code && code <= 90) {
       return code - 65 + 27;
    }

    if (97 <= code && code <= 122) {
       return code - 97 + 1;
    }

    return 0;
}

function getCommonItems(x: string, y: string): string {
    let common = "";
    for (const c of x.split("")) {
        if (y.includes(c) && !common.includes(c)) common += c;
    }

    return common;

}

function toGroupsOfThree(lines: string[]): string[][] {
    let start = 0;
    const result: string[][] = [];

    while (start < lines.length) {
        const group = lines.slice(start, start + 3)
        result.push(group);
        start += 3;
    }

    return result;
}

async function solve() {
    const lines = await readLinesFromFile(__dirname + "/input.txt");
    const rucksacks = lines.map(toCompartments);
    const total = rucksacks.map((rucksack) => {
        const [a, b] = rucksack;
        const common = getCommonItems(a, b);
        return common.split("").map(getPriority).reduce((x,y) => x + y)
    }).reduce((x, y) => x + y);
    console.log(total);

    const groupsOf3 = toGroupsOfThree(lines);
    const total2 = groupsOf3.map((group) => {
        const common = group.reduce(getCommonItems);
        return common.split("").map(getPriority).reduce((x,y) => x + y)
    }).reduce((x, y) => x + y);
    console.log(total2);
}


solve().catch((err) => {
    console.log("An error occurred", err);
})