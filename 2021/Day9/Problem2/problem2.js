const delay = ms => new Promise(res => setTimeout(res, ms));

function rgbToYIQ({ r, g, b }) {
    return ((r * 299) + (g * 587) + (b * 114)) / 1000;
}
function hexToRgb(hex) {
    if (!hex || hex === '') {
        return undefined;
    }

    const result =
        /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : undefined;
}

function contrast(colorHex, threshold = 128) {
    if (colorHex === undefined) {
        return '#000';
    }

    const rgb = hexToRgb(colorHex);

    if (rgb === undefined) {
        return '#000';
    }

    return rgbToYIQ(rgb) >= threshold ? '#000' : '#fff';
}

function randomColor() {
    let color = "FFFFFF";

    while (color === "FFFFFF") {
        color = Math.floor(Math.random()*16777215).toString(16);
    }
    return color;
}


function FindNeighbors(i,j, color, textColor, grid, gridHtml) {
    let basinCount = 1;

    if (gridHtml[i][j].color) {
        return 0;
    }

    //Self
    gridHtml[i][j].color = "#" + color;
    gridHtml[i][j].textColor = textColor;
    gridHtml[i][j].classes.push("basin");

    //Up
    if (i-1 >= 0 && grid[i-1][j] !== 9) {
        basinCount += FindNeighbors(i-1, j, color, textColor, grid, gridHtml);
    }

    //Down
    if (i+1 <= (grid.length-1) && grid[i+1][j] !== 9) {
        basinCount += FindNeighbors(i+1, j, color, textColor, grid, gridHtml);
    }

    //Left
    if (j-1 >= 0 && grid[i][j-1] !== 9) {
        basinCount += FindNeighbors(i, j-1, color, textColor, grid, gridHtml);
    }

    //Right
    if (j+1 <= (grid[0].length-1) && grid[i][j+1] !== 9) {
        basinCount += FindNeighbors(i, j+1, color, textColor, grid, gridHtml);
    }

    return basinCount;
}

document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {
        const inputs = reader.result.split(/\r|\n/).map(line => {
            return line.split('').map(entry => Number(entry));
        }).filter(line => line.length > 0);

        let html = '';

        let lowPoints = [];
        let gridHtml = [];

        let gridRows = '';
        let gridColumns = '';


        for (let i = 0; i < inputs.length; i++) {
            gridHtml.push([]);
            gridRows += "1fr ";
            for (let j = 0; j < inputs[i].length; j++) {
                if (i === 0) {
                    gridColumns += "1fr ";
                }


                const entry = inputs[i][j];
                let classes = ["location"];

                const lessThanAbove = i<=0 || inputs[i-1][j] > entry;
                const lessThanBelow = i>=(inputs.length-1) || inputs[i+1] && inputs[i+1][j] > entry;
                const lessThanLeft = j<=0 || inputs[i][j-1] > entry;
                const lessThanRight = j>=(inputs[i].length-1) || inputs[i][j+1] > entry;

                if (lessThanAbove && lessThanBelow && lessThanLeft && lessThanRight) {
                    classes.push("hit");
                    lowPoints.push({i,j});
                }

                gridHtml[i].push({classes:classes});
            }
        }

        let basins = [];

        for (const lowPoint of lowPoints) {
            let color = randomColor();
            color = ((color +"").length === 5 ? "0" + color : color);
            const textColor = contrast(color);
            basins.push(FindNeighbors(lowPoint.i, lowPoint.j, color, textColor, inputs, gridHtml));
        }

        basins.sort((a,b) => {
            return b - a;
        })

        for (let i = 0; i < inputs.length; i++) {
            for (let j = 0; j < inputs[i].length; j++ ) {
                if (gridHtml[i][j].color) {
                    html += `<div class="${gridHtml[i][j].classes.join(" ")}" style="background-color: ${gridHtml[i][j].color}; color: ${gridHtml[i][j].textColor}">${inputs[i][j]}</div>`;
                } else {
                    html += `<div class="${gridHtml[i][j].classes.join(" ")}">${inputs[i][j]}</div>`;
                }
            }
        }

        const answer = basins[0] * basins[1] * basins[2];

        document.getElementById("map").style.display = "grid";
        document.getElementById("map").style.gap = "1px";
        document.getElementById("map").style.gridTemplateRows = gridRows;
        document.getElementById("map").style.gridTemplateColumns = gridColumns;

        document.getElementById("map").innerHTML = html;
        document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});