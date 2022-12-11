import { readContentsFromFile } from "../utility";

type Stacks = {[key: number]: Stack}
// top of stack is first item in list
type Stack = string[]

function pushToStack(stack: Stack, item: string) {
    stack.unshift(item);
}

function removeItemsFromStack(stack: Stack): string {
    // const removed = stack.sl
    return "";
}

function move(stacks: Stacks, sourceStackKey: number, targetStackKey: number, noOfItems: number, retainOrder?: boolean) {
    const sourceStack = stacks[sourceStackKey];
    const targetStack = stacks[targetStackKey];

    const itemsToRemove = sourceStack.splice(0, noOfItems);
    if (!retainOrder) {
        itemsToRemove.reverse();
    }
    const newTargetStack = [...itemsToRemove, ...targetStack];
    stacks[targetStackKey] = newTargetStack;
}

function getSecretKey(stacks: Stacks): string {
    let secretKey = "";
    for (const key in stacks) {
        secretKey += stacks[key][0];
    }
    return secretKey;
}

function getMove(text: string): number[] {
    const arr = text.split(" ");
    return [arr[1], arr[3], arr[5]].map(Number);
}

function runMoves(stacks: Stacks, moves: string[]) {
    moves.forEach((m) => {
        const [noOfItems, sourceStackKey, targetStackKey] = getMove(m);
        // Remove true to run part 1
        move(stacks, sourceStackKey, targetStackKey, noOfItems, true);
    });
}

async function solve() {
    const testStacks = {
        1: ["N", "Z"],
        2: ["D", "C", "M"],
        3: ["P"]
    }


    const stacks = {
        1: ["G", "P", "N", "R"],
        2: ["H", "V", "S", "C", "L", "B", "J", "T"],
        3: ["L", "N", "M", "B", "D", "T"],
        4: ["B", "S", "P", "V", "R"],
        5: ["H", "V", "M", "W", "S", "Q", "C", "G"],
        6: ["J", "B", "D", "C", "S", "Q", "W"],
        7: ["L", "Q", "F"],
        8: ["V", "F", "L", "D", "T", "H", "M", "W"],
        9: ["F", "J", "M", "V", "B", "P", "L"]
    }

    const text = await readContentsFromFile(__dirname + "/input.txt");
    const [_stackText, moveText] = text.split("\r\n\r\n");
    const moves = moveText.split("\r\n");
    runMoves(stacks, moves);
    console.log(getSecretKey(stacks))
}

solve().catch((err) => {
    console.log("An error occurred", err)
})