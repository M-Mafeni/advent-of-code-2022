import { readContentsFromFile } from "../utility";

interface Operation {
    sign: "+" | "*";
    value: number | "old";
}

interface Test {
    divisor: number;
    trueMonkey: number;
    falseMonkey: number;
}

interface Monkey {
    items: number[];
    operation: Operation;
    test: Test;
    itemsInspected: number;
}

type MonkeyMap = Record<number, Monkey>;

function runOperation(old: number, operation: Operation): number {
    const value = operation.value === "old" ? old : operation.value;
    if (operation.sign === "+") {
        return old + value;
    }
    return old * value;
}

function getNewMonkey(level: number, test: Test): number {
    if (level % test.divisor === 0) {
        return test.trueMonkey;
    } else {
        return test.falseMonkey;
    }
}

function runRound(monkeys: MonkeyMap) {
    for (const key of Object.keys(monkeys).map(Number)) {
        const monkey = monkeys[key];
        for (const item of monkey.items) {
            const newLevel = runOperation(item, monkey.operation);
            const boredLevel = Math.floor(newLevel / 3);
            const newMonkey = getNewMonkey(boredLevel, monkey.test);
            monkeys[newMonkey].items.push(boredLevel);
        }
        monkey.itemsInspected += monkey.items.length;
        monkey.items = [];
    }
    // console.log(monkeys);
}

function runRounds(monkeys: MonkeyMap) {
    for(let i = 0; i < 20; i++) {
        runRound(monkeys);
    }
}

function parseMonkey(text: string): [number, Monkey] {
    const lines = text.split("\r\n");
    const id = Number(lines[0].substring(7, lines[0].length - 1));
    const items = lines[1].substring(18).split(", ").map(Number);
    const [sign, value] =  lines[2].substring(23).split(" ");
    const operation = {sign, value: value === "old" ? "old" : Number(value)} as Operation;
    const divisor = Number(lines[3].substring(21));
    const trueMonkey = Number(lines[4].substring(29));
    const falseMonkey = Number(lines[5].substring(30));
    const test = {divisor, trueMonkey, falseMonkey}
    return [id, {items, operation, test, itemsInspected: 0}]
}

function parseMonkeys(content: string): MonkeyMap {
    const monkeyText = content.split("\r\n\r\n");
    const monkeyMap: MonkeyMap = {};
    monkeyText.forEach((text) => {
        const [id, monkey] = parseMonkey(text);
        monkeyMap[id] = monkey;
    })
    return monkeyMap;
}
async function solve() {
    const content = await readContentsFromFile(__dirname + "/input.txt");
    const monkeys = parseMonkeys(content);
    runRounds(monkeys);
    const monkeysSorted = Object.values(monkeys).sort((a, b) => b.itemsInspected - a.itemsInspected);
    console.log(monkeysSorted[0].itemsInspected * monkeysSorted[1].itemsInspected);
}

solve().catch(err => console.log("An error occurred", err));
