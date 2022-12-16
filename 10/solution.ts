import { readLinesFromFile } from "../utility";

interface AddX {
    value: number;
}

type Instr = "Noop" | AddX;

function runInstructions(instructions: Instr[]): number {
    let register = 1;
    let cycle = 1;
    let currentExec: AddX | null = null;
    let currInstIndex = 0;
    let signalStrengthSum = 0;
    while (currInstIndex < instructions.length || currentExec) {
        // Calc signal strength
        if ((cycle - 20) % 40 === 0) {
            signalStrengthSum += register * cycle;
        } 

        // Check current executing instruction Decrease ttl or execute it
        if (!currentExec) {
            const inst = currInstIndex >= instructions.length ? "Noop" : instructions[currInstIndex];
            if (inst !== "Noop") {
                // Add to execution queue
                currentExec = inst;
            } else {
                currInstIndex++;
            }
        } else {
            register += currentExec.value;
            currentExec = null;
            currInstIndex++;
        }
        // console.log({cycle, register, currentExec, currInstIndex});
        cycle++;
    }
    return signalStrengthSum;
}

async function solve() {
    const lines = await readLinesFromFile(__dirname + "/input.txt");
    const instructions: Instr[] = lines.map((line) => {
        if (line === "noop") {
            return "Noop"
        } else {
            const [_i, x] = line.split(" ");
            return {value: Number(x)}
        }
    });

    const signalSum = runInstructions(instructions);
    console.log(signalSum);
}

solve().catch((err) => console.log("An error occurred", err));