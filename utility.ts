const fs = require("fs").promises;

export async function readContentsFromFile(filePath: string): Promise<string> {
    return fs.readFile(filePath).then((res: any) => String(res));
}

export async function readLinesFromFile(filePath: string): Promise<string[]> {
    return readContentsFromFile(filePath).then(text => text.split("\r\n"));
} 