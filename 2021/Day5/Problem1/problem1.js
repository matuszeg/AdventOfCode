const delay = ms => new Promise(res => setTimeout(res, ms));

function DisplayGrid(coordinates, max) {
    let html = '';

    let xFr = '';
    let yFr = '';

    for (let y = 0; y<= max[1]; y++) {
        yFr += '1fr ';
    }

    for (let x = 0; x <= max[0]; x++) {
        xFr += "1fr ";
        for (let y = 0; y <= max[1]; y++) {
            const displayValue = coordinates[x][y] === 0 ? ' ' : coordinates[x][y]+'';
            html += `<div class="coordinate" style="grid-column:'${x} / ${x+1}';grid-row:'${y} / ${y+1}'">${displayValue}</div>`;
        }
    }

    document.getElementById('grid').innerHTML = html;
    document.getElementById('grid').style.display = `grid`;
    document.getElementById('grid').style.gap = `1px`;
    document.getElementById('grid').style.gridTemplateColumns = xFr;
    document.getElementById('grid').style.gridTemplateRows = yFr;
}


document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {

        const inputs = reader.result.split(/\r|\n/)

        let coords = [];
        let max = [0,0];
        for (let input of inputs) {
            const points = input.split('->');
            points.forEach((element, index, array) => {
                array[index] = element.trim();
            })

            let coord = [];

            for (let point of points) {
                let splitPoint = point.split(',');
                splitPoint = [Number(splitPoint[0]), Number(splitPoint[1])];
                if (splitPoint[0] > max[0]) {
                    max[0] = splitPoint[0];
                }
                if (splitPoint[1] > max[1]) {
                    max[1] = splitPoint[1];
                }
                coord.push(splitPoint);
            }

            coords.push(coord);
        }

        let grid = [];

        for (let x = 0; x <= max[0]; x++) {
            let row = [];
            for (let y = 0; y <= max[1]; y++) {
                row.push(0);
            }
            grid.push(row);
        }

        let answer = 0;

        for (let coord of coords) {
            if (coord[0][1] === coord[1][1]) {
                const least = coord[0][0] < coord[1][0] ? coord[0][0] : coord[1][0];
                const most = coord[0][0] > coord[1][0] ? coord[0][0] : coord[1][0];
                const y = coord[0][1];

                for (let i = least; i <= most; i++) {
                    grid[i][y]++;
                    if (grid[i][y] === 2) {
                        answer++;
                    }
                }
            }
            else if (coord[0][0] === coord[1][0]) {
                const least = coord[0][1] < coord[1][1] ? coord[0][1] : coord[1][1];
                const most = coord[0][1] > coord[1][1] ? coord[0][1] : coord[1][1];
                const x = coord[0][0];
                for (let i = least; i <= most; i++) {
                    grid[x][i]++;
                    if (grid[x][i] === 2) {
                        answer++;
                    }
                }
            } else {
               //Dont deal with this right now
            }
        }

        document.getElementById("answer").innerText = answer + "";

        DisplayGrid(grid, max);
    }


    reader.readAsText(this.files[0]);
});