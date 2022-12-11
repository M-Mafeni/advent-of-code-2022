import { readContentsFromFile } from "../utility";

function countCharactersTillFirstDetection(text: string, packetLength: number = 4): number {
    for (let i = 0; i < text.length; i++) {
        const window = text.slice(i, i + packetLength);
        if (new Set(window).size === window.length) {
            return i + packetLength;
        }
    }
    return -1;
}

async function solve() { 
    // console.log(countCharactersTillFirstDetection("bvwbjplbgvbhsrlpgdmjqwftvncz", 14));
    // console.log(countCharactersTillFirstDetection("nppdvjthqldpwncqszvftbrmjlhg", 14));
    // console.log(countCharactersTillFirstDetection("nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg", 14));    
    // console.log(countCharactersTillFirstDetection("zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw", 14));
    
    const text = await readContentsFromFile(__dirname + "/input.txt");
    console.log(countCharactersTillFirstDetection(text));
    console.log(countCharactersTillFirstDetection(text, 14));
}

solve().catch((err) => console.log("An error occurred", err));