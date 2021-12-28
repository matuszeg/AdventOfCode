const delay = ms => new Promise(res => setTimeout(res, ms));

function ProcessStep(polymerMap, instructionMap) {
    let newMap = new Map();

    polymerMap.forEach((numPair, pair) => {
        const newLetter = instructionMap.get(pair);
        for (let i = 0; i<2;i++) {
            let newPair = '';
            if (i===0) {
                newPair = pair.charAt(0) + newLetter;
            } else {
                newPair = newLetter + pair.charAt(1);
            }
            const mapVal = newMap.get(newPair)
            if (newMap.has(newPair)) {
                newMap.set(newPair, mapVal+numPair);
            } else {
                newMap.set(newPair, numPair);
            }
        }
    });
    return newMap;
}

function PrintStep(num, polymerMap) {
    let html = `<div class="polymer"><h3>Step ${num}:</h3>`;
    polymerMap.forEach((count, key) => {
        html += `<div class="pair">Pair: ${key} Count: ${count}</div>`;
    });

    html += `</div>`;
    document.getElementById('polymers').innerHTML += html;
}

document.getElementById('inputfile').addEventListener('change', function () {
    const reader = new FileReader();
    reader.onload= async function() {

        const inputs = reader.result.split(/\n\n/);
        const startingPolymer = inputs[0];
        const instructions = inputs[1].split(/\r|\n/).filter(line=> line.length > 0).map(line => {
            return line.split(' -> ');
        });

        let instructionMap = new Map();

        for (const instruction of instructions) {
            instructionMap.set(instruction[0], instruction[1]);
        }

        const numSteps = document.getElementById('numSteps').value;

        let polymerMap = new Map();

        let currentPolymerArray = startingPolymer.split('');
        for (let i = 0; i < currentPolymerArray.length-1; i++) {
            const pair = currentPolymerArray[i] + currentPolymerArray[i+1];
            const mapVal = polymerMap.get(pair);
            if (polymerMap.has(pair)) {
                polymerMap.set(pair, mapVal+1);
            } else {
                polymerMap.set(pair, 1);
            }
        }
        PrintStep(0, polymerMap);
        for (let i = 0; i < numSteps; i++) {
            console.log("Step: " + (i+1));
            polymerMap = ProcessStep(polymerMap, instructionMap);
            PrintStep(i+1, polymerMap);
        }
        let least = 99999999999999999999;
        let most = 0;

        let countMap = new Map();
        polymerMap.forEach((count, pair) => {
            for (let i = 0; i<2;i++) {
                const letter = pair.charAt(i);
                const mapVal = countMap.get(letter);
                if (countMap.has(letter)) {
                    countMap.set(letter, count+mapVal);
                } else {
                    countMap.set(letter, count);
                }
            }
        });

        countMap.forEach((count, letter) => {
            let realCount = count;

            if (letter === currentPolymerArray[0] || letter === currentPolymerArray[currentPolymerArray.length-1]) {
                realCount += 1;
            }
            realCount /= 2;

            if (realCount > most) {
                most = realCount;
            }
            if (realCount < least) {
                least = realCount;
            }
        });

        const answer = most - least;

        document.getElementById("answer").innerText = answer + "";
    }

    reader.readAsText(this.files[0]);
});