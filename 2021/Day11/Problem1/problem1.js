const delay = ms => new Promise(res => setTimeout(res, ms));

const moveSpeedSliderElement = document.getElementById("moveSpeed");
const moveSpeedValueElement = document.getElementById("moveSpeedValue");
moveSpeedValueElement.innerHTML = moveSpeedSliderElement.value + " milliseconds"; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
moveSpeedSliderElement.oninput = function() {
    moveSpeedValueElement.innerHTML = this.value + " milliseconds";
}

async function Step(energyLevels) {
    FirstStep(energyLevels);
    await Render(energyLevels);
    const numFlashes = await ProcessFlash(energyLevels);
    PostProcess(energyLevels);
    return numFlashes;
}

function FirstStep (energyLevels) {
    for (let i = 0; i< energyLevels.length; i++) {
        for (let j = 0; j< energyLevels[i].length; j++) {
            energyLevels[i][j].energy++;
            energyLevels[i][j].flash = false;
        }
    }
}

function PostProcess (energyLevels) {
    for (let i = 0; i< energyLevels.length; i++) {
        for (let j = 0; j< energyLevels[i].length; j++) {
            if (energyLevels[i][j].energy > 9) {
                energyLevels[i][j].energy = 0;
            }
        }
    }
}

async function ProcessFlash (energyLevels) {
    let flashes = [];
    for (let i = 0; i< energyLevels.length; i++) {
        for (let j = 0; j< energyLevels[i].length; j++) {
            if (energyLevels[i][j].energy > 9 && !energyLevels[i][j].flash) {
                energyLevels[i][j].flash = true;
                flashes.push({i:i, j:j});
            }
        }
    }

    if (flashes.length <= 0) {
        return 0;
    }

    for (const {i,j} of flashes) {
        //Up
        if (i>0 && !energyLevels[i-1][j].flash) {
            energyLevels[i-1][j].energy++;
        }
        //Down
        if ((i+1)<(energyLevels.length) && !energyLevels[i+1][j].flash) {
            energyLevels[i+1][j].energy++;
        }
        //Left
        if (j>0 && !energyLevels[i][j-1].flash) {
            energyLevels[i][j-1].energy++;
        }
        //Right
        if ((j+1) <(energyLevels[i].length) && !energyLevels[i][j+1].flash) {
            energyLevels[i][j+1].energy++;
        }
        //TopLeft
        if (i>0 && j>0 && !energyLevels[i-1][j-1].flash) {
            energyLevels[i-1][j-1].energy++;
        }
        //TopRight
        if (i>0 && (j+1)<(energyLevels[i].length) && !energyLevels[i-1][j+1].flash) {
            energyLevels[i-1][j+1].energy++;
        }
        //BottomLeft
        if ((i+1)<(energyLevels.length) && j>0 && !energyLevels[i+1][j-1].flash) {
            energyLevels[i+1][j-1].energy++;
        }
        //BottomRight
        if ((i+1)<(energyLevels.length) && (j+1)<(energyLevels[i].length) && !energyLevels[i+1][j+1].flash) {
            energyLevels[i+1][j+1].energy++;
        }
    }

    await Render(energyLevels);

    return flashes.length + await ProcessFlash(energyLevels);
}

async function Render(energyLevels) {
    let html = "";

    for (let i = 0; i< energyLevels.length; i++) {
        html += `<div class="line">`;
        for (let j = 0; j< energyLevels[i].length; j++) {
            let classes = ["octopus"];
            if (energyLevels[i][j].energy === 0 || energyLevels[i][j].energy > 9) {
                classes.push("flash");
            }
            const displayNumber = energyLevels[i][j].energy <= 9 ? energyLevels[i][j].energy : 0;
            html += `<div class="${classes.join(' ')}">${displayNumber}</div>`;
        }
        html += `</div>`;
    }

    document.getElementById("map").innerHTML = html;

    await delay(document.getElementById("moveSpeed").value);
}

document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {
        const inputs = reader.result.split(/\r|\n/).map(line => {
            return line.split('').map(octopus => {
                return {energy: octopus, flash: false};
            });
        }).filter(line => line.length > 0);

        const numSteps = document.getElementById("numSteps").value;

        await Render(inputs);

        let answer = 0;

        for (let i = 0; i < numSteps; i++) {
            document.getElementById("currentStep").innerText = i+1;
            answer += await Step(inputs);
            await Render(inputs);
        }

        document.getElementById("answer").innerText = answer + "";
    }
    
    reader.readAsText(this.files[0]);
});