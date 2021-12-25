const delay = ms => new Promise(res => setTimeout(res, ms));

document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {
        const inputs = reader.result.split(/\r|\n/).map(line => {
            return line.split('');
        }).filter(line => line.length > 0);

        let html = '';
        let answer = 0;

        let gridRows = '';
        let gridColumns = '';
        for (let i = 0; i < inputs.length; i++) {
            gridRows += "1fr ";
            for (let j = 0; j < inputs[i].length; j++) {
                if (i === 0) {
                    gridColumns += "1fr ";
                }


                const entry = Number(inputs[i][j]);
                let classes = "location";

                const lessThanAbove = i<=0 || inputs[i-1][j] > entry;
                const lessThanBelow = i>=(inputs.length-1) || inputs[i+1] && inputs[i+1][j] > entry;
                const lessThanLeft = j<=0 || inputs[i][j-1] > entry;
                const lessThanRight = j>=(inputs[i].length-1) || inputs[i][j+1] > entry;

                if (lessThanAbove && lessThanBelow && lessThanLeft && lessThanRight) {
                    classes += " hit";
                    answer += entry+1;
                }

                html += `<div class="${classes}">${entry}</div>`;
            }
        }

        document.getElementById("map").style.display = "grid";
        document.getElementById("map").style.gap = "1px";
        document.getElementById("map").style.gridTemplateRows = gridRows;
        document.getElementById("map").style.gridTemplateColumns = gridColumns;

        document.getElementById("map").innerHTML = html;
        document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});