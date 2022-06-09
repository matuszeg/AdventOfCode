const scoreToWin = 21;
let largestSoFar = 0;

function playerLocTakeTurn(players, bPlayerOneTurn) {
    //27 options
    //const rolls = [3,4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,6,7,7,7,7,7,7,8,8,8,9];
    const rolls = [[3,1], [4,3], [5,6], [6,7], [7,6], [8,3], [9,1]];

    const playerIndex = bPlayerOneTurn ? 0 : 1;

    let playerWins = [0,0];

    for (const [rollResult, numRolls] of rolls) {
        const newLocation = (players[playerIndex][0] + rollResult) % 10;
        const newScore = players[playerIndex][1] + newLocation + 1; //Need to add 1, because location 0 is really 1, 1 is really 2 and so on. location 9 being 10

        if (newScore >= scoreToWin) {
            playerWins[playerIndex] += players[playerIndex][2] * numRolls;
        } else {
            const newPlayers = [[...players[0]], [...players[1]]];
            newPlayers[playerIndex][0] = newLocation;
            newPlayers[playerIndex][1] = newScore;
            newPlayers[0][2] *= numRolls;
            newPlayers[1][2] *= numRolls;

            const otherWins = playerLocTakeTurn(newPlayers, !bPlayerOneTurn);
            playerWins[0] += otherWins[0];
            playerWins[1] += otherWins[1];
        }
    }

    if (playerWins[0] > largestSoFar) {
        console.log(playerWins);
        largestSoFar = playerWins[0];
    } else if (playerWins[1] > largestSoFar) {
        console.log(playerWins);
        largestSoFar = playerWins[1];
    }

    return playerWins;
}


document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {
        const playerStarts = reader.result.split(/\n/).map(row=> {
            const splitRow =row.split(':');
            return Number(splitRow[splitRow.length-1])-1;
        });

        const startTime = Date.now();

        let players = [[playerStarts[0],0,1], [playerStarts[1],0,1]];

        const playerWins = playerLocTakeTurn(players, true);

        let mostUniversesWon = 0;

        if (playerWins[0] > playerWins[1])
        {
            mostUniversesWon = playerWins[0];
        }
        else
        {
            mostUniversesWon = playerWins[1];
        }

        console.log("Time Duration: " + (Date.now()-startTime).toString());

        const answer = mostUniversesWon;
        document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});