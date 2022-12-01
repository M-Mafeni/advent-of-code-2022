const fs = require("fs").promises;

async function solve() {
    const text: string = await fs.readFile(__dirname + "/input.txt").then((res: any) => String(res));
    const nums = text
        .split("\r\n\r\n")
        .map(val => val.split("\r\n").map(x => Number(x)));
    const totalCalories = nums.map(x => x.reduce((a,b) => a + b));
    console.log(Math.max(...totalCalories))
    totalCalories.sort((a,b) => b - a);
    console.log(totalCalories[0] + totalCalories[1] + totalCalories[2])
}

solve().catch((err) => {
    console.log("An error occurred", err);
})