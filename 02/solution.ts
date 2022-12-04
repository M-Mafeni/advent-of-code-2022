import { readContentsFromFile } from "../utility";

enum Move {
    Rock,
    Paper,
    Scissors
}

enum Result {
    Win,
    Lose,
    Draw
}

// return result from player's perspective
function getResult(opponent: Move, player: Move): Result {

    switch (player) {
        case Move.Rock:
            if (opponent === Move.Paper) return Result.Lose;
            if (opponent === Move.Scissors) return Result.Win;
            break;
        case Move.Paper:
            if (opponent === Move.Scissors) return Result.Lose;
            if (opponent === Move.Rock) return Result.Win;
            break;
        case Move.Scissors:
            if (opponent === Move.Rock) return Result.Lose;
            if (opponent === Move.Paper) return Result.Win;
            break;
    }

    return Result.Draw;
}

const getMoveScore = (m: Move): number => {
    switch(m) {
        case Move.Rock: return 1;
        case Move.Paper: return 2;
        case Move.Scissors: return 3;
    }
}

function getResultScore(result: Result): number {
    switch (result) {
        case Result.Win: return 6;
        case Result.Lose: return 0;
        case Result.Draw: return 3;
    }
}

function calcScore(opponent: Move, player: Move): number {
    const result = getResult(opponent, player);
    const resultScore = getResultScore(result);

    const moveScore = getMoveScore(player);
    
    // console.log({opponent, player, resultScore, moveScore});
    return moveScore + resultScore;
}

function convertLine(line: string): [Move, Move] {
    const [oppChar, playerChar] = line.split(" ");
    let oppMove;
    switch(oppChar) {
        case "A":
            oppMove = Move.Rock;
            break;
        case "B":
            oppMove = Move.Paper;
            break;
        default: // case C
            oppMove = Move.Scissors;
    }

    let playerMove;
    switch(playerChar) {
        case "X":
            playerMove = Move.Rock;
            break;
        case "Y":
            playerMove = Move.Paper;
            break;
        default: // case Z
            playerMove = Move.Scissors;
    }

    return [oppMove, playerMove]
}

async function solve() {
    const text = await readContentsFromFile(__dirname + "/input.txt");
    const solution1 = text
        .split("\r\n")
        .map((line) => {
          const [opponent, player] = convertLine(line);
        //   console.log(score);
        //   console.log();
          return calcScore(opponent, player);
        })
        .reduce((x,y) => x + y)
    console.log(solution1);
}

solve().catch((err) => {
    console.log("An error occurred", err);
})