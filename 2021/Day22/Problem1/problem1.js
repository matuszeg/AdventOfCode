const delay = ms => new Promise(res => setTimeout(res, ms));

const moveSpeedSliderElement = document.getElementById("moveSpeed");
const moveSpeedValueElement = document.getElementById("moveSpeedValue");
moveSpeedValueElement.innerHTML = moveSpeedSliderElement.value + " milliseconds"; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
moveSpeedSliderElement.oninput = function() {
    moveSpeedValueElement.innerHTML = this.value + " milliseconds";
}

document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {
        const inputs = reader.result.split(/\n/).map(row=> {
            const splitRow = row.split(' ');
            splitRow[0] = splitRow[0] === 'on';
            splitRow[1] = splitRow[1].split(',').map(coordPair =>
                coordPair.split('=')[1].split('..').map(coord => Number(coord))
            );
            return splitRow;
        });

        //console.log(inputs);

        const grid = [];
        for (let x = -50; x <= 50; x++) {
            let xRow = [];
            for (let y = -50; y <= 50; y++) {
                let yRow = [];
                for (let z = -50; z <= 50; z++) {
                    yRow.push(false);
                }
                xRow.push(yRow);
            }
            grid.push(xRow);
        }


                //for (const [start,stop] of coordinatePair) {




        for (const [bOnOff, coordinates] of inputs) {
            const realStartX = (coordinates[0][0] < -50 ? -50 : coordinates[0][0] > 50 ? 50 : coordinates[0][0]);
            const realStopX = (coordinates[0][1] < -50 ? -50 : coordinates[0][1] > 50 ? 50 : coordinates[0][1]);

            const realStartY = (coordinates[1][0] < -50 ? -50 : coordinates[1][0] > 50 ? 50 : coordinates[1][0]);
            const realStopY = (coordinates[1][1] < -50 ? -50 : coordinates[1][1] > 50 ? 50 : coordinates[1][1]);

            const realStartZ = (coordinates[2][0] < -50 ? -50 : coordinates[2][0] > 50 ? 50 : coordinates[2][0]);
            const realStopZ = (coordinates[2][1] < -50 ? -50 : coordinates[2][1] > 50 ? 50 : coordinates[2][1]);

            if (realStartX === realStopX && (realStartX === -50 || realStartX === 50)) {
                continue;
            }

            if (realStartY === realStopY && (realStartY === -50 || realStartY === 50)) {
                continue;
            }

            if (realStartZ === realStopZ && (realStartZ === -50 || realStartZ === 50)) {
                continue;
            }

            for (let x = realStartX; x <= realStopX; x++) {
                for (let y = realStartY; y <= realStopY; y++) {
                    for (let z = realStartZ; z <= realStopZ; z++) {
                        const realX = x + 50;
                        const realY = y + 50;
                        const realZ = z + 50;

                        grid[realX][realY][realZ] = bOnOff;

                    }
                }
            }
        }

        let numOn = 0;

        for (let x = -50; x <= 50; x++) {
            for (let y = -50; y <= 50; y++) {
                for (let z = -50; z <= 50; z++) {
                    const realX = x + 50;
                    const realY = y + 50;
                    const realZ = z + 50;

                    if (grid[realX][realY][realZ]) {
                        numOn++;
                    }
                }
            }
        }

        const answer = numOn;
        document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});