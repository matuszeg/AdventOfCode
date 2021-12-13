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

        let leastCostSpot = 99999999999999;
        let leastCost = 999999999999999;

        for (let spot = 0; spot < max; spot++) {
            let fuelCost = 0;
            for (let i = 0; i < inputs.length; i++) {
                const diff = Math.abs(inputs[i] - spot);
                for (let j = 1; j <= diff; j++) {
                    fuelCost += j;
                }
            }

            if (fuelCost < leastCost) {
                leastCost = fuelCost;
                leastCostSpot = spot;
            }
        }

        document.getElementById("answer").innerText = leastCost + "";
        document.getElementById("target").innerText = leastCostSpot + "";

        let isDone = false;

        while (!isDone) {
            isDone = true;
            for (let i = 0; i < inputs.length; i++) {
                if (inputs[i] < leastCostSpot) {
                    inputs[i]++;
                } else if (inputs[i] > leastCostSpot) {
                    inputs[i]--;
                }

                if (inputs[i] !== leastCostSpot) {
                    isDone = false;
                }
            }

            DisplayStep(inputs, max);
            await delay(document.getElementById("moveSpeed").value);
        }
    }

    reader.readAsText(this.files[0]);
});