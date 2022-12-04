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

function getPlayerMove(opponent: Move, outcome: Result) {
    switch(opponent) {
        case Move.Rock:
            switch(outcome){
                case Result.Win: return Move.Paper;
                case Result.Lose: return Move.Scissors;
                case Result.Draw: return Move.Rock;
            }
        case Move.Paper:
            switch(outcome){
                case Result.Win: return Move.Scissors;
                case Result.Lose: return Move.Rock;
                case Result.Draw: return Move.Paper;
            }
        case Move.Scissors:
            switch(outcome){
                case Result.Win: return Move.Rock;
                case Result.Lose: return Move.Paper;
                case Result.Draw: return Move.Scissors;
            }
    }
}

function convertLinePart1(line: string): [Move, Move] {
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

function convertLinePart2(line: string): [Move, Result] {
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

    let playerOutcome;
    switch(playerChar) {
        case "X":
            playerOutcome = Result.Lose;
            break;
        case "Y":
            playerOutcome = Result.Draw;
            break;
        default: // case Z
            playerOutcome = Result.Win;
    }

    return [oppMove, playerOutcome]
}
async function solve() {
    const text = await readContentsFromFile(__dirname + "/input.txt");
    const lines = text.split("\r\n");
    const solution1 = lines
        .map((line) => {
          const [opponent, player] = convertLinePart1(line);
        //   console.log(score);
        //   console.log();
          return calcScore(opponent, player);
        })
        .reduce((x,y) => x + y)
    
    console.log(solution1);

    const solution2 = lines
        .map((line) => {
          const [opponent, outcome] = convertLinePart2(line);
          const playerMove = getPlayerMove(opponent, outcome);
          return calcScore(opponent, playerMove);
        })
        .reduce((x,y) => x + y);
    
    console.log(solution2);
}

solve().catch((err) => {
    console.log("An error occurred", err);
})