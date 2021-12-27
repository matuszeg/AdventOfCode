const delay = ms => new Promise(res => setTimeout(res, ms));

const mapGrids = [];

function DrawMap(map) {
    let html = `<div class='map'>`;
    let gridRows = '';
    let gridColumns = '';
    for (let i = 0; i < map.length; i++) {
        gridRows += '1fr ';
        for (let j=0; j< map[i].length; j++) {
            if (i===0) {
                gridColumns += '1fr ';
            }
            html += `<div class="coordinate">${map[i][j]}</div>`;
        }
    }

    html += `</div>`;

    document.getElementById('mapContainer').innerHTML = html;

    for (const mapElement of document.getElementsByClassName("map")) {
        mapElement.style.display = "grid";
        mapElement.style.gridTemplateRows = gridRows;
        mapElement.style.gridTemplateColumns = gridColumns;
    }
}

function CalculateMap(coordinates) {
    let maxX = 0;
    let maxY = 0;
    for (let i = 0; i < coordinates.length; i++) {
        if (coordinates[i][0] > maxX) {
            maxX = coordinates[i][0];
        }

        if (coordinates[i][1] > maxY) {
            maxY = coordinates[i][1];
        }
    }
    const map = [];
    for (let i = 0; i <= maxY; i++) {
        map.push([]);
        for (let j = 0; j <= maxX; j++) {
            map[i].push('.');
        }
    }

    for (let hit of coordinates) {
        map[hit[1]][hit[0]] = '#';
    }

    return map;
}

function FoldMap(map, instruction) {
    const axis = Number(instruction[1]);
    if (instruction[0] === 'x') {
        // for (let i = 0; i < map.length; i++) {
        //     map[i][axis] = '|';
        // }


        for (let x = 1; x < map[0].length-axis; x++) {
            for (let y = 0; y < map.length; y++) {
                if (axis-x < 0) {
                    break;
                }
                if (map[y][axis-x] !== '#' && map[y][axis+x] === '#') {
                    map[y][axis-x] = '#';
                }
            }
        }
        for (let y = 0; y < map.length; y++) {
            map[y].splice(axis);
        }
    } else {
        for (let y = 1; y < map.length-axis; y++) {
            for (let x = 0; x < map[0].length; x++) {
                if (axis-y < 0) {
                    break;
                }
                if (map[axis-y][x] !== '#' && map[axis+y][x] === '#') {
                    map[axis-y][x] = '#';
                }
            }
        }

        map.splice(axis);
    }
}

function DrawMapByNumber(num) {
    DrawMap(mapGrids[num]);
}

function DrawSelectStep() {
    const selectStep = document.getElementById('selectStep');
    selectStep.innerHTML = '';
    for (let i = 0; i< mapGrids.length; i++) {
        selectStep.innerHTML += `<input type="button" onclick="DrawMapByNumber(${i})" value="Draw Map ${i}"></div>`;
    }
}

function CountDots(map) {
    let count = 0;
    for (let i = 0; i< map.length; i++) {
        for (let j = 0; j< map[0].length; j++) {
            if (map[i][j] === '#') {
                count++;
            }
        }
    }
    return count;
}

document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {

        const inputs = reader.result.split(/\n\n/);
        const coordinates = inputs[0].split(/\r|\n/).map(line => {
            return line.split(',').map(number => Number(number));
        });
        const instructions = inputs[1].split(/\r|\n/).filter(line=> line.length > 0).map(line => {
            return line.split(' ')[2].split('=');
        });

        mapGrids.push(CalculateMap(coordinates));

        const newMap = [];
        for (let i = 0; i< mapGrids.length; i++) {
            newMap.push(...mapGrids[i]);
        }

        FoldMap(newMap, instructions[0]);

        mapGrids.push(newMap);

        DrawMap(mapGrids[1]);

        DrawSelectStep();

        const answer = CountDots(mapGrids[1]);

        document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});