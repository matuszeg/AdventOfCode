const delay = ms => new Promise(res => setTimeout(res, ms));

const ballSpeedSliderElement = document.getElementById("ballSpeed");
const ballSpeedValueElement = document.getElementById("ballSpeedValue");
ballSpeedValueElement.innerHTML = ballSpeedSliderElement.value + " milliseconds"; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
ballSpeedSliderElement.oninput = function() {
    ballSpeedValueElement.innerHTML = this.value + " milliseconds";
}

document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {

        const inputs = reader.result.split(/\r|\n/)

        const calledNumbers = inputs[0].split(',');

        let boards = [];
        let boardElements = "";

        let boardCount = 0;
        for (let i = 1; i< inputs.length; i+=6) {
            boards[boardCount] = [];
            boardElements += '<div class="board">';
            for (let j = i+1; j<i+6; j++) {
                const row = inputs[j].split(" ");
                let counterRow = [];
                boardElements += '<div class="row">';
                for (let boardNumber of row) {
                    if (boardNumber !== '' && boardNumber !== ' ' ) {
                        counterRow.push({num: boardNumber, fired: false});
                        boardElements += `<div class="board_number">${boardNumber}</div>`;
                    }
                }
                boards[boardCount].push(counterRow);
                boardElements += '</div>';
            }

            boardElements += '</div>';

            boardCount++;
        }

        document.getElementById('boards').innerHTML = boardElements;
        let bSuccess = false;
        let answer = 0;
        for (let callNumber of calledNumbers) {
            document.getElementById('drawn_numbers').innerText += ` ${callNumber}`;

            boardElements = "";
            let winnerFound = false;

            let sumUncalled = 0;
            for (let board of boards) {
                let boardElement = "";
                //boardElements += '<div class="board">';
                let columnSums = [0,0,0,0,0];
                if (!bSuccess) {
                    sumUncalled = 0;
                }
                for (let i =0; i<board.length; i++) {
                    boardElement += '<div class="row">'
                    const row = board[i];
                    let numRowFired = 0;
                    for (let tile of row) {
                        if (tile.num === callNumber) {
                            tile.fired = true;
                        }

                        if (tile.fired) {
                            numRowFired++;
                            columnSums[i]++;
                            boardElement += `<div class="board_number called" >${tile.num}</div>`;
                        } else {
                            if (!bSuccess) {
                                sumUncalled += Number(tile.num);
                            }
                            boardElement += `<div class="board_number">${tile.num}</div>`;
                        }
                    }

                    boardElement += '</div>';

                    if (numRowFired === 5) {
                        bSuccess = true;
                    }
                }

                for (let columnSum of columnSums) {
                    if (columnSum === 5) {
                        bSuccess = true;
                        break;
                    }
                }

                if (bSuccess && !winnerFound) {
                    winnerFound = true;
                    boardElement = '<div class="board winner">' + boardElement + '</div>';
                } else {
                    boardElement = '<div class="board">' + boardElement + '</div>';
                }

                boardElements += boardElement;
            }

            document.getElementById('boards').innerHTML = boardElements;

            if (bSuccess) {
                answer = sumUncalled * Number(callNumber);
                break;
            }

            await delay(document.getElementById("ballSpeed").value);
        }

         document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});