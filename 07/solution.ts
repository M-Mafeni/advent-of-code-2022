import { readLinesFromFile } from "../utility";

interface ElfFile {
    parent?: Directory;
    filename: string;
    size: number;
}

interface Directory {
    parent?: Directory;
    dirname: string;
    files: (ElfFile | Directory)[];
    totalSize?: number;
}

const rootDir =  {dirname: "root", files: []}

function isFile(x: ElfFile | Directory): x is ElfFile {
    return (x as ElfFile).filename != null;
}

function toDirOrFile(line: string): (ElfFile | Directory) {
    const [x, y] = line.split(" ");
    if (x === "dir") {
        return {dirname: y, files: []};
    } else {
        return {filename: y, size: Number(x)};
    }
}

function ls(currDir: Directory, lines: string[]) {
    const files = lines.map(toDirOrFile);
    files.forEach((f) => f.parent = currDir);
    currDir.files = files;
}


function cd(currDir: Directory, locationName: String): Directory {
    switch (locationName) {
        case "/":
            let root = currDir;
            let isRoot = false;
            while (!isRoot) {
                if (currDir.parent == null) {
                    isRoot = true;
                } else {
                   root = cd(currDir, "..");
                }
            }
            return root;
        case "..":
            if (currDir.parent !== undefined) {
                return currDir.parent;
            }
            return currDir;
        default:
            return currDir.files.find((f) => !isFile(f) && f.dirname === locationName) as Directory;
    }
}

function isCommand(line: string): boolean {
    return line.charAt(0) === "$";
}

function runCommands(currDir: Directory, lines: string[]) {
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (isCommand(line)) {
            const items = line.split(" ");
            if (items[1] === "cd") {
                currDir = cd(currDir, items[2]);
                i++;
            } else {
                // ls command
                const files: string[] = [];
                let allFiles = false;
                i++;
                while (i < lines.length && !allFiles) {
                    if (!isCommand(lines[i])) {
                        files.push(lines[i]);
                        i++;
                    } else {
                        allFiles = true;
                    }
                }
                ls(currDir, files);
            }
        }
    }
}

function printFiletree(currDir: Directory, indentLevel: number = 1) {
    const makeSubTree = (f: ElfFile | Directory) => {
        const indents = "\t".repeat(indentLevel);
        if (isFile(f)) {
            console.log(indents + f.filename + " " + f.size);
        } else {
            printFiletree(f, indentLevel + 1);
        }
    }
    const rootIndent = "\t".repeat(indentLevel - 1);
    console.log(rootIndent + "Directory: ", currDir.dirname);
    console.log(rootIndent + "Total Size: " + currDir.totalSize)
    console.log(rootIndent + "Files: ",)
    currDir.files.forEach(makeSubTree);
    
}

function addTotalSize(currDir: Directory): number {
    const getTotalSize = (f: ElfFile | Directory) => {
        if (isFile(f)) {
            return f.size;
        } else {
            return addTotalSize(f);
        }
    }
    const totalSize = currDir.files.reduce((acc, f) => acc + getTotalSize(f), 0)
    currDir.totalSize = totalSize;
    return totalSize;
}

function solvePart1(currDir: Directory): number {
    const solvePart1Helper = (f: ElfFile | Directory) => {
        if (isFile(f)) {
            return 0;
        } else {
            return solvePart1(f);
        }
    }

    let sum = 0;
    if (currDir.totalSize && currDir.totalSize <= 100000) {
        sum += currDir.totalSize;
    }
    const subTreeSum = currDir.files.reduce((acc, f) => acc + solvePart1Helper(f), 0);
    sum += subTreeSum;
    return sum;
}

async function solve() {
    const currDir = {dirname: "root", files: []}
    const lines = await readLinesFromFile(__dirname + "/input.txt");
    runCommands(currDir, lines);

    const root = cd(currDir, "/");
    addTotalSize(root);
    console.log(solvePart1(root));
    // printFiletree(root);
}


solve().catch((err) => console.log("An error occurred", err));