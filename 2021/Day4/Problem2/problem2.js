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

        let solvedBoardIndexes = [];

        let firstSolvedStyled = false;

        for (let callNumber of calledNumbers) {
            document.getElementById('drawn_numbers').innerText += ` ${callNumber}`;

            boardElements = "";

            let sumUncalled = 0;
            for (let boardIndex = 0; boardIndex< boards.length; boardIndex++) {
                let bThisBoardSolved = solvedBoardIndexes.includes(boardIndex);
                const board = boards[boardIndex];
                let boardElement = "";
                let columnSums = [0,0,0,0,0];
                if (!bSuccess) {
                    sumUncalled = 0;
                }
                for (let i =0; i<board.length; i++) {
                    boardElement += '<div class="row">'
                    const row = board[i];
                    let numRowFired = 0;
                    for (let j = 0; j< row.length; j++) {
                        const tile = row[j];
                        if (tile.num === callNumber) {
                            tile.fired = true;
                        }

                        if (tile.fired) {
                            numRowFired++;
                            columnSums[j]++;
                            boardElement += `<div class="board_number called" >${tile.num}</div>`;
                        } else {
                            if (!bSuccess) {
                                sumUncalled += Number(tile.num);
                            }
                            boardElement += `<div class="board_number">${tile.num}</div>`;
                        }
                    }

                    boardElement += '</div>';

                    if (numRowFired === 5 && !bThisBoardSolved) {
                        solvedBoardIndexes.push(boardIndex);
                        bThisBoardSolved = true;
                    }
                }

                if (!bThisBoardSolved) {
                    for (let columnSum of columnSums) {
                        //console.log(columnSum);
                        if (columnSum === 5) {
                            solvedBoardIndexes.push(boardIndex);
                            bThisBoardSolved = true;
                            break;
                        }
                    }
                }

                if (bThisBoardSolved && solvedBoardIndexes.length === boards.length && !firstSolvedStyled) {
                    firstSolvedStyled = true;
                    boardElement = '<div class="board loser">' + boardElement + '</div>';
                    bSuccess = true;
                } else {
                    boardElement = '<div class="board">' + boardElement + '</div>';
                }
                boardElements += boardElement;
            }

            document.getElementById('boards').innerHTML = boardElements;

            if (bSuccess) {
                console.log(sumUncalled);
                console.log(callNumber);
                answer = sumUncalled * Number(callNumber);
                break;
            }

            await delay(document.getElementById("ballSpeed").value);
        }

        document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});