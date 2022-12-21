const fs = require("fs");

const day = process.argv[2];

fs.mkdirSync(day);

const tsTemplate = `
import {readContentsFromFile, readLinesFromFile} from "../utility";

async function solve() {

}

solve().catch(err => console.log("An error occurred", err));
`
fs.writeFileSync(`${day}/solution.ts`, tsTemplate);
fs.writeFileSync(`${day}/input.txt`, "");
fs.writeFileSync(`${day}/test.txt`, "");