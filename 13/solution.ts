import {readContentsFromFile} from "../utility";

async function solve() {
    const content = await readContentsFromFile(__dirname + "/test.txt");
    const pairs = content.split("\r\n\r\n");
}

solve().catch(err => console.log("An error occurred", err));
