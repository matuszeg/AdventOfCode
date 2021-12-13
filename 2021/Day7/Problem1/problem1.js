const delay = ms => new Promise(res => setTimeout(res, ms));

const moveSpeedSliderElement = document.getElementById("moveSpeed");
const moveSpeedValueElement = document.getElementById("moveSpeedValue");
moveSpeedValueElement.innerHTML = moveSpeedSliderElement.value + " milliseconds"; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
moveSpeedSliderElement.oninput = function() {
    moveSpeedValueElement.innerHTML = this.value + " milliseconds";
}

function DisplayStep(locations, max) {
    let html = '';
    for (let i = 0; i < locations.length; i++) {
        for (let j = 0; j < max; j++) {
            if (locations[i] === j) {
                const percentLeft = j / max * 100;
                html += `<div class="coordinate ship" style="left:${percentLeft}%"></div>`;
            }
        }
    }

    document.getElementById('grid').innerHTML = html;
}

document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {

        let inputs = reader.result.split(',').map(input => {
            return Number(input);
        }).sort((first, second) => {
            if (first < second) {
                return -1;
            } else if (first > second) {
                return 1;
            }
            return 0;
        });

        const max = inputs[inputs.length-1];
        const median = inputs[inputs.length/2-1];

        let fuelCost = 0;

        for (let i = 0; i < inputs.length; i++) {
            fuelCost += Math.abs(inputs[i] - median);
        }

        document.getElementById('grid').style.display = `grid`;
        document.getElementById('grid').style.gap = `1px`;
        document.getElementById('grid').style.gridTemplateColumns = inputs[inputs.length-1] + 'fr';
        document.getElementById('grid').style.gridTemplateRows = inputs.length + 'fr';

        let isDone = false;

        while (!isDone) {
            isDone = true;
            for (let i = 0; i < inputs.length; i++) {
                if (inputs[i] < median) {
                    inputs[i]++;
                } else if (inputs[i] > median) {
                    inputs[i]--;
                }

                if (inputs[i] !== median) {
                    isDone = false;
                }
            }

            DisplayStep(inputs, max);
            await delay(document.getElementById("moveSpeed").value);
        }

        document.getElementById("answer").innerText = fuelCost + "";
    }


    reader.readAsText(this.files[0]);
});