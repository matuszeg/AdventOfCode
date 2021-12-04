document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= function() {

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

            let sumUncalled = 0;
            for (let board of boards) {
                boardElements += '<div class="board">';
                let columnSums = [0,0,0,0,0];
                if (!bSuccess) {
                    sumUncalled = 0;
                }
                for (let i =0; i<board.length; i++) {
                    boardElements += '<div class="row">'
                    const row = board[i];
                    let numRowFired = 0;
                    for (let tile of row) {
                        if (tile.num === callNumber) {
                            tile.fired = true;
                        }

                        if (tile.fired) {
                            numRowFired++;
                            columnSums[i]++;
                            boardElements += `<div class="board_number called" >${tile.num}</div>`;
                        } else {
                            if (!bSuccess) {
                                sumUncalled += Number(tile.num);
                            }
                            boardElements += `<div class="board_number">${tile.num}</div>`;
                        }
                    }

                    boardElements += '</div>';

                    if (numRowFired === 5) {
                        bSuccess = true;
                    }
                }

                boardElements += '</div>';

                for (let columnSum of columnSums) {
                    if (columnSum === 5) {
                        bSuccess = true;
                        break;
                    }
                }
            }

            document.getElementById('boards').innerHTML = boardElements;

            if (bSuccess) {
                console.log(sumUncalled);
                console.log(callNumber);
                answer = sumUncalled * Number(callNumber);
                break;
            }


        }

         document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});