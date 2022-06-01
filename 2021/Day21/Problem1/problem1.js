const delay = ms => new Promise(res => setTimeout(res, ms));

const moveSpeedSliderElement = document.getElementById("moveSpeed");
const moveSpeedValueElement = document.getElementById("moveSpeedValue");
moveSpeedValueElement.innerHTML = moveSpeedSliderElement.value + " milliseconds"; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
moveSpeedSliderElement.oninput = function() {
    moveSpeedValueElement.innerHTML = this.value + " milliseconds";
}

class DartBoard {
    constructor(height, width) {
        this.board = document.getElementById('dartBoard');
        this.board.height = height;
        this.board.width = width;
        this.boardContext = this.board.getContext('2d');
        this.boardWidth = this.board.width;
        this.boardHeight = this.board.height;
        this.center = [this.boardWidth / 2, this.boardHeight / 2];
        this.boardRadius = this.boardWidth / 2;
    }

     async draw(playerLocations) {
        this.boardContext.clearRect(0, 0, this.boardWidth, this.boardHeight);
        this.drawCircle("#000000", "#0808ec");
        this.drawSpaces(playerLocations);
        //this.boardContext.fillRect(1,1,100, 100);

       await delay(document.getElementById("moveSpeed").value);
    }

    drawCircle(color, fillColor) {
        this.boardContext.beginPath();
        this.boardContext.lineWidth = 2;
        this.boardContext.strokeStyle = color;
        this.boardContext.arc(this.center[0], this.center[1], this.boardRadius, 0, 2 * Math.PI, false);

        if(fillColor) {
            this.boardContext.fillStyle = fillColor;
            console.log("fill");
            this.boardContext.fill();
        }

        this.boardContext.stroke();
    }

    drawSpaces(playerLocations) {
        const numSpaces = 10;
        const radialSpaceWidth = (2*Math.PI)/10;

        for(let spaceIndex = 0; spaceIndex < numSpaces; spaceIndex++) {
            const spaceNumber = 10-spaceIndex;
            this.boardContext.lineWidth = 3;
            this.boardContext.strokeStyle = 'white';
            this.boardContext.beginPath();
            this.boardContext.moveTo(this.center[0], this.center[1]);

            const x = this.center[0] + this.boardRadius * Math.sin(radialSpaceWidth * spaceIndex);
            const y = this.center[1] + this.boardRadius * Math.cos(radialSpaceWidth * spaceIndex);

            this.boardContext.lineTo(x, y);
            this.boardContext.stroke();

            const letterAngle = radialSpaceWidth * spaceIndex + radialSpaceWidth / 2.0;

            const letterX = this.center[0] + (this.boardRadius/2.0) * Math.sin(letterAngle);
            const letterY = this.center[1] + (this.boardRadius/2.0)* Math.cos(letterAngle);

            const letter = "" + (spaceNumber);
            this.boardContext.lineWidth = 1;
            this.boardContext.font = "Arial 50px";
            this.boardContext.strokeText(letter, letterX, letterY);

            for (let playerIndex = 0; playerIndex < playerLocations.length; playerIndex++) {
                if (playerLocations[playerIndex] !== spaceNumber) {
                    continue;
                }

                const playerX = this.center[0] + (this.boardRadius/(1.5 - .2*playerIndex )) * Math.sin(letterAngle);
                const playerY = this.center[1] + (this.boardRadius/(1.5 - .2*playerIndex )) * Math.cos(letterAngle);
                const playerText = "P" + (playerIndex+1);
                this.boardContext.strokeStyle = playerIndex === 0 ? "#7ecea9" : "#ee89b7"
                this.boardContext.strokeText(playerText, playerX, playerY);
            }
        }
    }
}


document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {
        const playerStarts = reader.result.split(/\n/).map(row=> {
            const splitRow =row.split(':');
            return Number(splitRow[splitRow.length-1]);
        });

        const board = new DartBoard(400,400);
        await board.draw([1,1]);

        let playerLocations = playerStarts;
        let playerScores = [0,0];
        let turnCount = 1;
        let dieCount = 1;
        let rollCount = 0;
        document.getElementById("turnCount").innerText = turnCount + "";
        document.getElementById("rollCount").innerText = rollCount + "";
        document.getElementById("playerScores").innerText = "Player 1:" + playerScores[0] + " Player 2:" + playerScores[1];
        while (playerScores[0] < 1000 && playerScores[1] < 1000) {

            for (let playerIndex = 0; playerIndex < playerLocations.length; playerIndex++) {
                for (let rollIndex = 0; rollIndex < 3; rollIndex++) {
                    playerLocations[playerIndex] += dieCount;
                    dieCount++;
                    rollCount++;
                    if (dieCount > 100) {
                        dieCount -= 100;
                    }
                }

                playerLocations[playerIndex] %= 10;
                if (playerLocations[playerIndex] === 0) {
                    playerLocations[playerIndex] = 10;
                }

                playerScores[playerIndex] += playerLocations[playerIndex];

                if (playerScores[playerIndex] >= 1000) {
                    //Stop immediately if any player wins
                    break;
                }
            }

            turnCount++;
            document.getElementById("turnCount").innerText = "TurnCount: " + turnCount;
            document.getElementById("rollCount").innerText = "RollCount: " + rollCount;
            document.getElementById("playerScores").innerText = "Player 1:" + playerScores[0] + " Player 2:" + playerScores[1];
            await board.draw(playerLocations);

        }

        let lowerScore = 0;

        if (playerScores[0] < 1000)
        {
            lowerScore = playerScores[0];
        }

        if (playerScores[1] < 1000)
        {
            lowerScore = playerScores[1];
        }


        const answer = lowerScore * rollCount;
        document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});