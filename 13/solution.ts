import {readContentsFromFile} from "../utility";
import {TreeNode} from "./types";
import {parseNode} from "./parser";
import { assert } from "console";

// null means no decision was made
function isPacketOrder(packet: [TreeNode, TreeNode]): boolean | null {
    const [l1, l2] = packet;
    const stopLen = Math.min(l1.length, l2.length)
    let i = 0;
    while (i < stopLen) {
        const x = (i < l1.length) ? l1[i] : null;
        const y = (i < l2.length) ? l2[i] : null;
        if (y === null && x !== null) {
            // Right side ran out of items. list is not sorted
            return false;
        } else if (x === null) {
            // Left side ran out of items. list is sorted
            return true;
        } else {
            if (y === null) {
                throw new Error("This should be unreachable. Investigate")
            }
            if (typeof x === "number" && typeof y === "number") {
                // Both numbers compare
                if (x < y) {
                   return true; 
                } else if (x > y) {
                    return false;
                } else {
                    i++;
                }
            } else if (typeof x === "object" && typeof y === "object" ) {
                // Both items are list
                const listOrder = isPacketOrder([x, y]);
                if (listOrder !== null) {
                    return listOrder;
                } else {
                    i++;
                }
            } else if (typeof x === "object" && typeof y === "number") {
                // y is a number
                const listOrder = isPacketOrder([x, [y]]);
                if (listOrder !== null) {
                    return listOrder;
                } else {
                    i++;
                }
            } else if (typeof x === "number" && typeof y === "object") {
                // y is a list, x is a number
                const listOrder = isPacketOrder([[x], y]);
                if (listOrder !== null) {
                    return listOrder;
                } else {
                    i++;
                }
            }
        }
    }
    if (l1.length < l2.length) {
        // left side ran out of items
        return true;
    } else if (l1.length > l2.length) {
        // right side ran out of items
        return false;
    } else {
        return null;
    }
}

function parsePacket(text: string): [TreeNode, TreeNode] {
    const [l1, l2] = text.split("\r\n").map(parseNode);
    if (l1 == null || l2 == null) {
        throw new Error("Failed to parse " + text);
    }
    return [l1, l2];
}

async function solve() {
    const content = await readContentsFromFile(__dirname + "/input.txt");
    const pairs = content.split("\r\n\r\n").map(parsePacket);
    const part1Sol = pairs.map((pair, i) => isPacketOrder(pair) ? i + 1 : 0).reduce((x, y) => x + y)
    console.log(part1Sol);
    const allPackets = content.split("\r\n").filter(x => x.length !== 0).map(x => parseNode(x) as TreeNode);
    const allPacketsWithDividers = [...allPackets, [[2]], [[6]]];
    allPacketsWithDividers.sort((a, b) => isPacketOrder([a, b]) ? -1 : 1)
    let div2Idx = -1;
    let div6Idx = -1;
    for (let i = 0; i < allPacketsWithDividers.length; i++) {
        const packet = allPacketsWithDividers[i];
        if (packet.length === 1 && typeof packet[0] === 'object' && packet[0].length === 1 && packet[0][0] === 2) {
            div2Idx = i + 1;
        } 
        if (packet.length === 1 && typeof packet[0] === 'object' && packet[0].length === 1 && packet[0][0] === 6) {
            div6Idx = i + 1;
        } 
    }
    console.log(div2Idx * div6Idx);
}

solve().catch(err => console.log("An error occurred", err));
