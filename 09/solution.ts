import { readLinesFromFile } from "../utility";

type Direction = "U" | "D" | "L" | "R";

interface Move {
    direction: Direction;
    value: number;
}

interface Position {
    x: number;
    y: number;
}

type Rope =  Record<'H' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, Position>;

function updateTail(head: Position, tail: Position): Position {
    const distance = {
        dx: head.x - tail.x,
        dy: head.y - tail.y
    }
    const newTail = {...tail};
    if (distance.dx === Math.sign(distance.dx) && distance.dy === Math.sign(distance.dy)) {
        // console.log({head, newTail, distance})
        return newTail;
    }

    if (distance.dx === 2 && distance.dy === 0) {
        // Head to the right, move tail to the right
        newTail.x += 1;
    } else if (distance.dx === -2 && distance.dy === 0) {
        // Head to the left of tail
        newTail.x -= 1;
    } else if (distance.dy === 2 && distance.dx === 0) {
        // Head above tail
        newTail.y += 1;
    } else if (distance.dy === -2 && distance.dx === 0) {
        // Head below tail
        newTail.y -= 1;
    } else if (distance.dx !== 0 && distance.dy !== 0) {
        // Not in same col or row, move tail diagonally
        newTail.x += Math.sign(distance.dx);
        newTail.y += Math.sign(distance.dy);
    }

    // console.log({head, newTail, distance})
    return newTail;
}

function addPosToList(positions: Position[], newPos: Position) {
    const exists = positions.some((p) => p.x === newPos.x && p.y === newPos.y);
    if (!exists) {
        positions.push(newPos);
    }
}

// Returns the new position of head and tail
function makeMove(head: Position, tail: Position, move: Move): [Position, Position, Position[]] {
    const newHead = {...head};
    let newTail = tail;
    const positions: Position[] = [];
    for (let i = 0; i < move.value; i++) {
        switch (move.direction) {
            case "U":
                newHead.y += 1;
                break;
            case "D":
                newHead.y -= 1;
                break;
            case "L":
                newHead.x -= 1;
                break;
            case "R": 
                newHead.x += 1;
                break;
        }
        // updateTail
        newTail = updateTail(newHead, newTail);
        addPosToList(positions, newTail);
    }
    
    return [newHead, newTail, positions];
}

// returns list of positions the tail has been in
function runMoves(moves: Move[]): Position[] {
    let head = {x: 0, y: 0};
    let tail = {x: 0, y: 0};
    const tailPositions = [{x: 0, y: 0}];

    for (const move of moves) {
        const [newHead, newTail, partialTailPos] = makeMove(head, tail, move);
        // console.log({partialTailPos});
        // console.log();
        head = newHead;
        tail = newTail;
        partialTailPos.forEach(pos => addPosToList(tailPositions, pos)); 
    }

    return tailPositions;
}

function updateRestOfRope(rope: Rope) {
    // console.log(rope);
    for (let i = 1; i <= 9; i++) {
        // console.log("Knot no", i);
        // @ts-ignore
        const prevKnot = (i === 1) ? rope.H : rope[i - 1];
        // @ts-ignore
        const knot: Position = {...rope[i]};
        const distance = {
            dx: prevKnot.x - knot.x,
            dy: prevKnot.y - knot.y
        }

        if (distance.dx === Math.sign(distance.dx) && distance.dy === Math.sign(distance.dy)) {
            // console.log({rope, distance})
            continue;
        }

        if (distance.dx === 2 && distance.dy === 0) {
            // Head to the right, move tail to the right
            knot.x += 1;
        } else if (distance.dx === -2 && distance.dy === 0) {
            // Head to the left of tail
            knot.x -= 1;
        } else if (distance.dy === 2 && distance.dx === 0) {
            // Head above tail
            knot.y += 1;
        } else if (distance.dy === -2 && distance.dx === 0) {
            // Head below tail
            knot.y -= 1;
        } else if (distance.dx !== 0 && distance.dy !== 0) {
            // Not in same col or row, move tail diagonally
            knot.x += Math.sign(distance.dx);
            knot.y += Math.sign(distance.dy);
        }

        // @ts-ignore
        rope[i] = knot;
        // console.log({i, knot})
    }
}

function makeMovePart2(rope: Rope, move: Move): [Rope, Position[]] {
    const newRope = {...rope};
    const positions: Position[] = [];

    for (let i = 0; i < move.value; i++) {
        switch (move.direction) {
            case "U":
                newRope.H.y += 1;
                break;
            case "D":
                newRope.H.y -= 1;
                break;
            case "L":
                newRope.H.x -= 1;
                break;
            case "R": 
                newRope.H.x += 1;
                break;
        }
        // update Rest of knots
        updateRestOfRope(newRope);
        addPosToList(positions, newRope[9]);
    }
    // console.log(newRope);

    return [newRope, positions]
}

function runMovesPart2(moves: Move[]): Position[] {
    let rope: Rope = {
        H: {x: 0, y: 0},
        1: {x: 0, y: 0},
        2: {x: 0, y: 0},
        3: {x: 0, y: 0},
        4: {x: 0, y: 0},
        5: {x: 0, y: 0},
        6: {x: 0, y: 0},
        7: {x: 0, y: 0},
        8: {x: 0, y: 0},
        9: {x: 0, y: 0}
    };

    const tailPositions = [{x: 0, y: 0}];

    for (const move of moves) {
        const [newRope, partialTailPos] = makeMovePart2(rope, move);
        // console.log({partialTailPos});
        // console.log();
        rope = newRope;
        partialTailPos.forEach(pos => addPosToList(tailPositions, pos)); 
    }

    return tailPositions;
}

async function solve() {
    const lines = await readLinesFromFile(__dirname + "/input.txt");
    const moves = lines.map((line) => {
        const [direction, val1] = line.split(" ");
        return {direction: direction as Direction, value: Number(val1)}
    });

    const tailPositions = runMoves(moves);
    console.log(tailPositions.length);

    const tailPositions2 = runMovesPart2(moves);
    console.log(tailPositions2.length);
}

solve().catch((err) => console.log("An error occurred", err));